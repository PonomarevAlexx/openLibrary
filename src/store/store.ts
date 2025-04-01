import { configureStore } from "@reduxjs/toolkit";
import { booksReducer } from "./slices/books-slice";
import { oneBookReducer } from "./slices/book-slice";
// import { booksReducer, userReducer, oneBookReducer } from "@slices";

export const store = configureStore({
    reducer: {
        books: booksReducer,
        book: oneBookReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
