import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../store";

const BOOKS_LIMIT = 25;
const LIBRARY = "https://openlibrary.org";
// const LIBRARY_COVERS = "https://covers.openlibrary.org/b/olid/";

type Status = {
    LOADING: "loading";
    RESOLVED: "resolved";
    REJECTED: "rejected";
};

export type Book = {
    author_name: string[];
    cover_edition_key: string;
    key: string;
    title: string;
    first_publish_year: string;
};

type Data = {
    numFound: number;
    docs: [];
};

export type State = {
    bookList: Book[];
    numberOfPages: number;
    currentPage: number;
    status?: string;
    error?: string;
};

type MyKnownError = {
    errorMessage: string;
};

type UserAttributes = {
    request: string;
    page: number;
    sort: string;
};

const STATUS_LOADING: Status = {
    LOADING: "loading",
    RESOLVED: "resolved",
    REJECTED: "rejected",
};

export const fetchBooks = createAsyncThunk<
    Data,
    UserAttributes,
    {
        rejectValue: MyKnownError;
    }
>("@books/fetchBooks", async function (attributes, thunkApi) {
    const { request, page, sort } = attributes;

    const response = await fetch(`${LIBRARY}/search.json?q=${request}&page=${page}&sort=${sort}&limit=${BOOKS_LIMIT}`);

    if (!response.ok) {
        return thunkApi.rejectWithValue((await response.json()) as MyKnownError);
    }

    return (await response.json()) as Data;
});

const initialState: State = {
    bookList: [],
    status: "",
    error: "",
    numberOfPages: 0,
    currentPage: 1,
};

export const booksSlice = createSlice({
    name: "books",
    initialState,
    reducers: {
        changePage: (state, action) => {
            state.currentPage = action.payload;
        },
        resetPage: (state) => {
            state.currentPage = 1;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchBooks.pending, (state) => {
            state.status = STATUS_LOADING.LOADING;
            state.error = "";
        });
        builder.addCase(fetchBooks.fulfilled, (state, action) => {
            state.status = STATUS_LOADING.RESOLVED;
            state.bookList = action.payload.docs;
            state.numberOfPages = Math.floor(action.payload.numFound / BOOKS_LIMIT + 1);
        });
        builder.addCase(fetchBooks.rejected, (state, action) => {
            state.status = STATUS_LOADING.REJECTED;
            if (typeof action.payload === "string") {
                state.error = action.payload;
            }
        });
    },
});

export const booksReducer = booksSlice.reducer;

export const { changePage, resetPage } = booksSlice.actions;

export const selectAllBooks = (state: RootState): Book[] => {
    return (state as { books: State }).books.bookList;
};

export const selectStatus = (state: RootState): string | undefined => {
    return (state as { books: State }).books.status;
};

export const selectError = (state: RootState): string | undefined => {
    return (state as { books: State }).books.error;
};

export const isBooksLoadingSelector = (state: RootState): boolean => {
    return (state as { books: State }).books.status === STATUS_LOADING.LOADING;
};

export const selectNumberOfPages = (state: RootState): number => {
    return (state as { books: State }).books.numberOfPages;
};

export const selectPage = (state: RootState): number => {
    return (state as { books: State }).books.currentPage;
};
