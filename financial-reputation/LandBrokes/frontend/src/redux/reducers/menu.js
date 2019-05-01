import { TOGGLE_SIDEBAR } from "../actionTypes";

import getSidebarNavItems from "../../data/sidebar-nav-items";

const initialState = {
  menuVisible: false,
  navItems: getSidebarNavItems()
};

export default function(state = initialState, action) {
  switch (action.type) {
    case TOGGLE_SIDEBAR: {
      return {
        ...state,
        menuVisible: !state.state,
      };
    }
    default:
      return state;
  }
}
