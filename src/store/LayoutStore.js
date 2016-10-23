import {observable, computed, action} from "mobx";

const bp = {
  sm: 768,
  md: 992,
  lg: 1200
};

export class LayoutStore {
  @observable sideBarOpen = false;
  @observable screen = {width: 0, height: 0};

  constructor() {
    window.addEventListener("resize", this.handleResize);

    this.screen = {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  @computed get breakpoint() {
    const width = this.screen.width;
    const active = {};
    if (width < bp.sm) active.xs = true;
    if (width >= bp.sm) active.su = true;
    if (width >= bp.sm && width < bp.md) active.sm = true;
    if (width >= bp.md && width < bp.lg) active.md = true;
    if (width >= bp.md) active.mu = true;
    if (width >= bp.lg) active.lg = true;

    return active;
  }

  @computed get sideBarDocked() {
    return this.sideBarOpen && this.breakpoint.su;
  }

  @action handleResize = () => {
    this.screen.width = window.innerWidth;
    this.screen.height = window.innerHeight;
    if (!this.breakpoint.su && this.sideBarOpen) {
      this.toggleSideBarOpen();
    }
  };

  @action toggleSideBarOpen = () => {
    this.sideBarOpen = !this.sideBarOpen;
  };
}

const layoutStore = new LayoutStore();

export default layoutStore;
