-- Table: public.platforms
-- DROP TABLE public.platforms;
CREATE TABLE public.platforms
(
    id bigint NOT NULL DEFAULT nextval('platforms_id_seq'::regclass),
    description character varying(50) COLLATE pg_catalog."default" NOT NULL,
    account boolean NOT NULL,
    CONSTRAINT platforms_pkey PRIMARY KEY (id),
    CONSTRAINT uk_platforms_description UNIQUE (description)
)
TABLESPACE pg_default;
ALTER TABLE public.platforms OWNER to postgres;
INSERT INTO public.platforms(id, description, account) VALUES (1, 'SOS', true);
INSERT INTO public.platforms(id, description, account) VALUES (2, 'RPC', false);

-- Table: public.users
-- DROP TABLE public.users;
CREATE TABLE public.users
(
    id bigint NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    snowflake character varying(20) COLLATE pg_catalog."default" NOT NULL,
    language character(2) COLLATE pg_catalog."default" NOT NULL,
    email character varying(50) COLLATE pg_catalog."default",
    salt character varying(64) COLLATE pg_catalog."default",
    CONSTRAINT users_pkey PRIMARY KEY (id)
)
TABLESPACE pg_default;
ALTER TABLE public.users OWNER to postgres;

-- Index: uk_users_email
-- DROP INDEX public.uk_users_email;
CREATE UNIQUE INDEX uk_users_email
    ON public.users USING btree
    (email COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default
    WHERE email IS NOT NULL;

-- Table: public.accounts
-- DROP TABLE public.accounts;
CREATE TABLE public.accounts
(
    id bigint NOT NULL DEFAULT nextval('accounts_id_seq'::regclass),
    platform_id bigint NOT NULL,
    user_id bigint NOT NULL,
    key character varying(36) COLLATE pg_catalog."default" NOT NULL,
    secret character varying(50) COLLATE pg_catalog."default" NOT NULL,
    stamp timestamp with time zone NOT NULL,
    CONSTRAINT accounts_pkey PRIMARY KEY (id),
    CONSTRAINT fk_accounts_platform_id FOREIGN KEY (platform_id)
        REFERENCES public.platforms (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_accounts_user_id FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)
TABLESPACE pg_default;
ALTER TABLE public.accounts OWNER to postgres;

-- Table: public.coins
-- DROP TABLE public.coins;
CREATE TABLE public.coins
(
    id bigint NOT NULL DEFAULT nextval('coins_id_seq'::regclass),
    name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    ticker character varying(5) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT coins_pkey PRIMARY KEY (id),
    CONSTRAINT uk_coins_name UNIQUE (name),
    CONSTRAINT uk_coins_ticker UNIQUE (ticker)
)
TABLESPACE pg_default;
ALTER TABLE public.coins OWNER to postgres;

-- Table: public.addresses
-- DROP TABLE public.addresses;
CREATE TABLE public.addresses
(
    id bigint NOT NULL DEFAULT nextval('addresses_id_seq'::regclass),
    user_id bigint NOT NULL,
    coin_id bigint NOT NULL,
    platform_id bigint NOT NULL,
    address character varying(50) COLLATE pg_catalog."default",
    CONSTRAINT addresses_pkey PRIMARY KEY (id),
    CONSTRAINT uk_addresses_address UNIQUE (coin_id, address),
    CONSTRAINT fk_addresses_coin_id FOREIGN KEY (coin_id)
        REFERENCES public.coins (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_addresses_platform_id FOREIGN KEY (platform_id)
        REFERENCES public.platforms (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_addresses_user_id FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)
TABLESPACE pg_default;
ALTER TABLE public.addresses OWNER to postgres;

-- Table: public.balances
-- DROP TABLE public.balances;
CREATE TABLE public.balances
(
    id bigint NOT NULL DEFAULT nextval('balances_id_seq'::regclass),
    address_id bigint NOT NULL,
    balance numeric(17,8) NOT NULL,
    stamp timestamp with time zone NOT NULL,
    CONSTRAINT balances_pkey PRIMARY KEY (id),
    CONSTRAINT fk_balances_address_id FOREIGN KEY (address_id)
        REFERENCES public.addresses (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)
TABLESPACE pg_default;
ALTER TABLE public.balances OWNER to postgres;