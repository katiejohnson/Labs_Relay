import React from "react";
import { Nav } from "shards-react";

import SidebarNavItem from "./SidebarNavItem";
import { connect } from "react-redux";

class SidebarNavItems extends React.Component {

  render() {
    const { navItems: items } = this.props;
    return (
      <div className="nav-wrapper">
        <Nav className="nav--no-borders flex-column">
          {items.map((item, idx) => (
            <SidebarNavItem key={idx} item={item} />
          ))}
        </Nav>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    navItems: state.menu.navItems
  };
};

export default connect(mapStateToProps)(SidebarNavItems);
