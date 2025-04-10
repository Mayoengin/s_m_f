import { createStore } from 'vuex';
import auth from './modules/auth';
import posts from './modules/posts';
import comments from './modules/comments';
import users from './modules/users';
import reels from './modules/reels';

export default createStore({
  modules: {
    auth,
    posts,
    comments,
    users,
    reels
  }
});