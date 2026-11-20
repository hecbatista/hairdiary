/**
 * Manual Jest mock for `lib/supabase.ts`, used by `jest.mock("../supabase")` in tests.
 *
 * The real module creates a client from `.env` values and throws without them, so tests never
 * load it. Tests choose what each call resolves to with `mockUser()` and `createQueryBuilder()`.
 *
 * Read these helpers with `jest.requireMock("../supabase")`, not by importing this file:
 * a direct import is a separate module instance from the one the code under test sees.
 */

/** Result a mocked query resolves to, shaped like a Supabase response. */
export interface MockResult {
    data: unknown;
    error: unknown;
}

/** A mocked query builder: chainable `jest.fn()` methods that can also be awaited. */
export type MockQueryBuilder = Record<
    "select" | "insert" | "update" | "eq" | "order" | "single",
    jest.Mock
> &
    PromiseLike<MockResult>;

/** Stand-in for the Supabase client exported by `lib/supabase.ts`. */
export const supabase = {
    auth: { getUser: jest.fn() },
    from: jest.fn(),
    storage: { from: jest.fn() },
};

/**
 * Builds a chainable stand-in for a PostgREST query builder. Each builder method records its
 * call and returns the builder; awaiting the builder, or calling `.single()`, resolves to
 * `result`.
 *
 * @param result What the query resolves to.
 * @returns The mocked query builder.
 */
export function createQueryBuilder(result: MockResult): MockQueryBuilder {
    const chain = () => builder;
    const builder: MockQueryBuilder = {
        select: jest.fn(chain),
        insert: jest.fn(chain),
        update: jest.fn(chain),
        eq: jest.fn(chain),
        order: jest.fn(chain),
        single: jest.fn(() => Promise.resolve(result)),
        then: (onFulfilled, onRejected) => Promise.resolve(result).then(onFulfilled, onRejected),
    };

    return builder;
}

/**
 * Makes `supabase.auth.getUser()` resolve to the given user, or to no user.
 *
 * @param user The signed-in user, or null when signed out.
 */
export function mockUser(user: { id: string; email?: string } | null): void {
    supabase.auth.getUser.mockResolvedValue({ data: { user } });
}
