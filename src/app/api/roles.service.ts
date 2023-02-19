// Copyright (c) 2021 Olivier Ragheb
// Copyright (c) 2021 The Scriv Network developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

import {CStore} from "../store/store.class";
import {TDBStatus, TDBUser} from "../db/db.types";
import {TConfigCoin, TConfigEligibility} from "../config/config.type";

export class RolesService {

    // Adds a role to a guild(server) user.
    // Provided strings are snowflake values.
    private async add (guild: string, role: string, user: string) {
        const Guild = await this.store.discord.guilds.fetch(guild)
        if (!Guild) throw new Error('Guild does not exist: ' + guild)

        const Role = await Guild.roles.fetch(role)
        if (!Role) throw new Error('Role does not exist: ' + role)

        const Member = await Guild?.members.fetch(user)
        if (!Member) throw new Error('Member does not exist: ' + user)

        Member.roles.add(role).catch(error => console.error(error.message))
    }

    // Removes a role to a guild(server) user.
    // Provided strings are snowflake values.
    private async remove (guild: string, role: string, user: string) {
        const Guild = await this.store.discord.guilds.fetch(guild)
        if (!Guild) throw new Error('Guild does not exist: ' + guild)

        const Role = await Guild.roles.fetch(role)
        if (!Role) throw new Error('Role does not exist: ' + role)

        const Member = await Guild?.members.fetch(user)
        if (!Member) throw new Error('Member does not exist: ' + user)

        Member.roles.remove(role).catch(error => console.error(error.message))
    }

    // Returns a Collection <string, Role> of roles of a specific guild(server) user
    // Index is role snowflake
    private async current (guild: string, user: string) {
        const Guild = await this.store.discord.guilds.fetch(guild, false, true)
        if (!Guild) throw new Error('Guild does not exist: ' + guild)

        const Member = await Guild?.members.fetch({ user, force: true })
        if (!Member) throw new Error('Member does not exist: ' + user)

        return Member.roles.cache
    }

    // Creates a list, for a specified database user, with provided current coin status
    private async granted (usr: TDBUser, status: TDBStatus[]) {
        const r: TConfigCoin[] = []

        for (let i = 0; i < this.store.config.coins.length; i++) {
            const coin = this.store.config.coins[i]
            let total = 0

            status.map((s) => { if (s.ticker === coin.ticker) total += s.balance })

            const e: TConfigEligibility[] = []
            for (let j = 0; j < coin.eligibilities.length; j++) {
                const eligibility = coin.eligibilities[j]
                if ((typeof eligibility.min !== 'undefined' ? eligibility.min <= total : true) &&
                    (typeof eligibility.max !== 'undefined' ? eligibility.max > total : true)) {
                    e.push(eligibility)
                }
            }
            r.push({ ...coin, eligibilities: e })
        }
        return r
    }

    public async setRoles (usr: TDBUser, granted: TConfigCoin[]) {
        const rolesAll: string[] = this.store.config.coins.map((c) => c.eligibilities.map((e) => e.role)).flat()
        const rolesCurrent: string[] = (await this.current(this.store.config.guild, usr.snowflake)).map((r) => r.id)
        const rolesGranted: string[] = (granted).map((c) => c.eligibilities.map((e) => e.role)).flat()

        for (const role of rolesAll) {
            if (rolesCurrent.find((s) => s === role) && !rolesGranted.find((s) => s === role)) {
                await this.remove(this.store.config.guild, role, usr.snowflake)
                await this.store.log(`[${usr.snowflake}] Role removed: ${role}`)
            } else if (!rolesCurrent.find((s) => s === role) && rolesGranted.find((s) => s === role)) {
                await this.add(this.store.config.guild, role, usr.snowflake)
                await this.store.log(`[${usr.snowflake}] Role added: ${role}`)
            }
        }
    }

    async refreshUser (id: bigint): Promise<TConfigCoin[]> {
        const usr: TDBUser = (await this.store.db.getUser('id', id))[0]
        const status = (await this.store.db.getStatus(usr.id))

        const granted: TConfigCoin[] = await this.granted(usr, status)

        await this.setRoles(usr, granted)

        return granted
    }

    constructor(protected store: CStore) {}
}