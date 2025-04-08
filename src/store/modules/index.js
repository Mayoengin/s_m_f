// src/store/index.js
import { createStore } from 'vuex';
import auth from './modules/auth';
import posts from './modules/posts';
import comments from './modules/comments';
import users from './modules/users';

export default createStore({
  modules: {
    auth,
    posts,
    comments,
    users
  }
});