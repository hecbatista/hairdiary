import { fetchUserProfile, updateUserProfile, uploadProfilePicture } from "../supabaseProfile";

jest.mock("../supabase");

// The manual mock in lib/__mocks__/supabase.ts, as seen by the code under test.
const { supabase, createQueryBuilder, mockUser } =
    jest.requireMock<typeof import("../__mocks__/supabase")>("../supabase");

const USER = { id: "user-123", email: "curly.sue@hairdiary.test" };

beforeEach(() => {
    jest.clearAllMocks();
});

describe("fetchUserProfile", () => {
    it("queries only the signed-in user's row", async () => {
        mockUser(USER);
        const query = createQueryBuilder({
            data: { user_id: USER.id, hair_journey: null, profile_picture: null },
            error: null,
        });
        supabase.from.mockReturnValue(query);

        await fetchUserProfile();

        expect(supabase.from).toHaveBeenCalledWith("Users");
        expect(query.eq).toHaveBeenCalledWith("user_id", USER.id);
        expect(query.single).toHaveBeenCalled();
    });

    it("maps the database row to an app profile, naming the user from their email", async () => {
        mockUser(USER);
        supabase.from.mockReturnValue(
            createQueryBuilder({
                data: {
                    user_id: USER.id,
                    email: USER.email,
                    hair_journey: "Growing out my curls",
                    profile_picture: "https://example.test/pic.jpg",
                },
                error: null,
            }),
        );

        await expect(fetchUserProfile()).resolves.toEqual({
            name: "curly.sue",
            journey: "Growing out my curls",
            photoUri: "https://example.test/pic.jpg",
        });
    });

    it("uses an empty journey when none is saved", async () => {
        mockUser(USER);
        supabase.from.mockReturnValue(
            createQueryBuilder({
                data: { user_id: USER.id, hair_journey: null, profile_picture: null },
                error: null,
            }),
        );

        await expect(fetchUserProfile()).resolves.toMatchObject({ journey: "" });
    });

    // fetchUserProfile swallows errors and returns null (HomeScreen treats null as "no profile").
    it("returns null when no user is logged in, without querying", async () => {
        mockUser(null);

        await expect(fetchUserProfile()).resolves.toBeNull();
        expect(supabase.from).not.toHaveBeenCalled();
    });

    it("returns null when Supabase returns an error", async () => {
        mockUser(USER);
        supabase.from.mockReturnValue(
            createQueryBuilder({ data: null, error: { message: "JSON object requested" } }),
        );

        await expect(fetchUserProfile()).resolves.toBeNull();
    });
});

describe("updateUserProfile", () => {
    const profile = {
        name: "curly.sue",
        journey: "Big chop!",
        photoUri: "https://example.test/new.jpg",
    };

    it("updates the signed-in user's journey and picture", async () => {
        mockUser(USER);
        const query = createQueryBuilder({ data: [], error: null });
        supabase.from.mockReturnValue(query);

        await updateUserProfile(profile);

        expect(supabase.from).toHaveBeenCalledWith("Users");
        expect(query.update).toHaveBeenCalledWith({
            hair_journey: "Big chop!",
            profile_picture: "https://example.test/new.jpg",
        });
        expect(query.eq).toHaveBeenCalledWith("user_id", USER.id);
    });

    it("stores empty values as null", async () => {
        mockUser(USER);
        const query = createQueryBuilder({ data: [], error: null });
        supabase.from.mockReturnValue(query);

        await updateUserProfile({ name: "curly.sue", journey: "" });

        expect(query.update).toHaveBeenCalledWith({ hair_journey: null, profile_picture: null });
    });

    it("throws when no user is logged in, without updating", async () => {
        mockUser(null);

        await expect(updateUserProfile(profile)).rejects.toThrow("No user logged in!");
        expect(supabase.from).not.toHaveBeenCalled();
    });

    it("propagates Supabase errors", async () => {
        mockUser(USER);
        const error = { message: "permission denied for column email", code: "42501" };
        supabase.from.mockReturnValue(createQueryBuilder({ data: null, error }));

        await expect(updateUserProfile(profile)).rejects.toBe(error);
    });
});

describe("uploadProfilePicture", () => {
    const realFetch = global.fetch;
    const upload = jest.fn();
    const getPublicUrl = jest.fn();

    /** Makes `fetch(uri)` resolve to an image with the given number of bytes. */
    function mockImage(byteLength: number) {
        global.fetch = jest.fn().mockResolvedValue({
            arrayBuffer: () => Promise.resolve(new ArrayBuffer(byteLength)),
        });
    }

    beforeEach(() => {
        jest.spyOn(Date, "now").mockReturnValue(1700000000000);
        supabase.storage.from.mockReturnValue({ upload, getPublicUrl });
        upload.mockImplementation((path: string) =>
            Promise.resolve({ data: { path }, error: null }),
        );
        getPublicUrl.mockImplementation((path: string) => ({
            data: { publicUrl: `https://storage.example.test/profile_picture/${path}` },
        }));
    });

    afterEach(() => {
        global.fetch = realFetch;
        jest.restoreAllMocks();
    });

    it("uploads into the user's own folder and returns the public URL", async () => {
        mockUser(USER);
        mockImage(1024);

        const url = await uploadProfilePicture("file:///tmp/photo.PNG");

        const expectedPath = `${USER.id}/${USER.id}-1700000000000.png`;
        expect(supabase.storage.from).toHaveBeenCalledWith("profile_picture");
        expect(upload).toHaveBeenCalledWith(expectedPath, expect.any(ArrayBuffer), {
            contentType: "image/png",
            upsert: true,
        });
        expect(url).toBe(`https://storage.example.test/profile_picture/${expectedPath}`);
    });

    it("throws when no user is logged in, without uploading", async () => {
        mockUser(null);
        mockImage(1024);

        await expect(uploadProfilePicture("file:///tmp/photo.jpg")).rejects.toThrow(
            "No user logged in!",
        );
        expect(upload).not.toHaveBeenCalled();
    });

    it("rejects an empty image file", async () => {
        mockUser(USER);
        mockImage(0);

        await expect(uploadProfilePicture("file:///tmp/photo.jpg")).rejects.toThrow(
            "Image file is empty",
        );
        expect(upload).not.toHaveBeenCalled();
    });

    it("propagates storage errors", async () => {
        mockUser(USER);
        mockImage(1024);
        const error = { message: "The object exceeded the maximum allowed size" };
        upload.mockResolvedValue({ data: null, error });

        await expect(uploadProfilePicture("file:///tmp/photo.jpg")).rejects.toBe(error);
    });
});
