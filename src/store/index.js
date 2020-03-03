import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

/*
      Sample data to be kept in recentQuotes:

      quoteNumber: '',
      company: '',
      pathToQuote: '',
      pathToWorkingDirectory: '',
      timeCreated: '', // Epoch time

    */

const getDefaultState = () => {
  let recentQuotes = null;

  if (!localStorage.getItem("recentQuotes")) {
    localStorage.setItem("recentQuotes", JSON.stringify([]));
    recentQuotes = JSON.stringify([]);
    console.log("Made new recent quotes array in local storage");
  } else {
    recentQuotes = localStorage.getItem("recentQuotes");
  }

  return {
    recentQuotes: recentQuotes
  };
};

export default new Vuex.Store({
  state: getDefaultState(),
  mutations: {
    clearRecentQuotes(state) {
      localStorage.setItem("recentQuotes", JSON.stringify([]));
      state.recentQuotes = JSON.stringify([]);
    },

    addRecentQuote(state, quote) {
      console.log("got here");
      let recentQuotes = JSON.parse(localStorage.getItem("recentQuotes"));
      let newRecentQuote = JSON.parse(quote);

      // Check to make sure we're not adding the same quote twice. Unique key is quote num with revision.
      for (let i = 0; i < recentQuotes.length; i++) {
        if (recentQuotes[i].quoteNumber === newRecentQuote.quoteNumber) {
          recentQuotes.splice(i, 1);
          console.log("got here");
        }
      }

      if (recentQuotes.length === 20) {
        recentQuotes.unshift(newRecentQuote);
        recentQuotes.pop();
      } else {
        recentQuotes.unshift(newRecentQuote);
      }
      state.recentQuotes = JSON.stringify(recentQuotes);
      localStorage.setItem("recentQuotes", JSON.stringify(recentQuotes));
    }
  },
  actions: {},
  modules: {},
  getters: {
    recentQuotes: state => {
      return state.recentQuotes;
    }
  }
});
