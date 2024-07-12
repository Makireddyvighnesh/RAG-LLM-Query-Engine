// // features/Chat/chatSlice.js

// import { createSlice } from '@reduxjs/toolkit';
// import { apiSlice } from '../Auth/apiSlice.js';

// const initialState = {
//   messages: [],
//   loading: false,
//   error: null,
// };

// export const chatSlice = createSlice({
//   name: 'chat',
//   initialState,
//   reducers: {
//     setMessages: (state, action) => {
//       state.messages = action.payload;
//       state.loading = false;
//       state.error = null;
//     },
//     setLoading: (state) => {
//       state.loading = true;
//       state.error = null;
//     },
//     setError: (state, action) => {
//       state.loading = false;
//       state.error = action.payload;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addMatcher(apiSlice.endpoints.getMessages.matchPending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addMatcher(apiSlice.endpoints.getMessages.matchFulfilled, (state, action) => {
//         state.messages = action.payload;
//         state.loading = false;
//         state.error = null;
//       })
//       .addMatcher(apiSlice.endpoints.getMessages.matchRejected, (state, action) => {
//         state.loading = false;
//         state.error = action.error.message;
//       });
//   },
// });

// export const { setMessages, setLoading, setError } = chatSlice.actions;

// export default chatSlice.reducer;
