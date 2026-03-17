CREATE TABLE public.orders (
    id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    "orderId" uuid NOT NULL UNIQUE,
    "filmId" uuid NOT NULL REFERENCES public.films(id) ON DELETE CASCADE,
    "sessionId" uuid NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
    "filmTitle" varchar NOT NULL,
    daytime timestamp with time zone NOT NULL,
    hall integer NOT NULL,
    row integer NOT NULL,
    seat integer NOT NULL,
    price double precision NOT NULL,
    "seatKey" varchar NOT NULL,
    status varchar NOT NULL DEFAULT 'confirmed',
    "customerEmail" varchar,
    "customerPhone" varchar,
    "createdAt" timestamp with time zone DEFAULT now(),
    "updatedAt" timestamp with time zone DEFAULT now()
);
ALTER TABLE public.orders OWNER TO prac;