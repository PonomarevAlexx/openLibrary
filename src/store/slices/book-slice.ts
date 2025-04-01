import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../store";

const LIBRARY = "https://openlibrary.org";
// const LIBRARY_COVERS = "https://covers.openlibrary.org/b/olid/";

type Status = {
    LOADING: "loading";
    RESOLVED: "resolved";
    REJECTED: "rejected";
};

type Book = {
    author_name: string[];
    cover_i: number;
    key: string;
    title: string;
    description: string | { type: string; value: string };
    subjects?: string[];
};

export type State = {
    book: Book;
    status?: string;
    error?: string;
};

type MyKnownError = {
    errorMessage: string;
};

const STATUS_LOADING: Status = {
    LOADING: "loading",
    RESOLVED: "resolved",
    REJECTED: "rejected",
};

export const fetchOneBook = createAsyncThunk<
    Book,
    string,
    {
        rejectValue: MyKnownError;
    }
>("@book/fetchOneBooks", async function (key, thunkApi) {
    const response = await fetch(`${LIBRARY}${key}.json`);

    if (!response.ok) {
        return thunkApi.rejectWithValue((await response.json()) as MyKnownError);
    }
    return (await response.json()) as Book;
});

const initialState: State = {
    book: {
        author_name: [],
        cover_i: 0,
        key: "",
        title: "",
        description: "",
        subjects: [],
    },
    status: "",
    error: "",
};

export const oneBookSlice = createSlice({
    name: "book",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchOneBook.pending, (state) => {
            state.status = STATUS_LOADING.LOADING;
            state.error = "";
        });
        builder.addCase(fetchOneBook.fulfilled, (state, action) => {
            state.status = STATUS_LOADING.RESOLVED;
            state.book = action.payload;
        });
        builder.addCase(fetchOneBook.rejected, (state, action) => {
            state.status = STATUS_LOADING.REJECTED;
            if (typeof action.payload === "string") {
                state.error = action.payload;
            }
        });
    },
});

export const oneBookReducer = oneBookSlice.reducer;

export const selectBook = (state: RootState): Book => {
    return (state as { book: State }).book.book;
};

export const selectStatus = (state: RootState): string | undefined => {
    return (state as { book: State }).book.status;
};

export const selectError = (state: RootState): string | undefined => {
    return (state as { book: State }).book.error;
};

export const isBooksLoadingSelector = (state: RootState): boolean => {
    return (state as { book: State }).book.status === STATUS_LOADING.LOADING;
};
