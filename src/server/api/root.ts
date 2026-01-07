import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { companyRouter } from "./routers/company";
import { itemsRouter } from "./routers/items";
import { ordersRouter } from "./routers/orders";
import { userRouter } from "./routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	user: userRouter,
	items: itemsRouter,
	orders: ordersRouter,
	company: companyRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
