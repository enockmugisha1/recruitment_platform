# Things to know:

Axios is being used for API communication.

The URL to the backend is stored in "/.env". "/src/api/axios.ts" uses the env file to get the URL, and sets up axios to use it as base, so when you use axios in any other file, you don't need to re-enter the base URL.

"/src/context/AuthProvider.tsx" is a context provider that provides functionality to store user data in memory, and to store authentication tokens.

There is no backend to handle login, so you can't login right now. You need to change the url in /.env, and modify the "loginUser" function in "/src/context/AuthProvider.jsx" to send the correct request. Make changes in that file to handle whatever user data, token data, or any other data you need.