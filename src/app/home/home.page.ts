import { Component, OnInit } from '@angular/core';
import { ElementRef, ViewChild } from '@angular/core';
import { TabBarService } from '../services/tab-bar.service';



//added codes
const TAB_PAGES: any[] = [
  {
    title: 'Dashboard',
    tab: 'dashboard',
    icon: 'cube-outline',
    inSidemenu: false,
    inTabBar: true,
    showTabBar: true
  },
  {
    title: 'Scan',
    tab: 'scanner',
    icon: 'barcode',
    inSidemenu: false,
    inTabBar: true,
    showTabBar: true,
  },
  {
    title: 'Routes',
    tab: 'routes',
    icon: 'locate',
    inSidemenu: false,
    inTabBar: true,
    showTabBar: true,
  },
  // {
  //   title: 'Support',
  //   tab: 'support-desk',
  //   icon: 'headset-outline',
  //   inSidemenu: false,
  //   inTabBar: true,
  //   showTabBar: true,
  // },
  {
    title: 'Account',
    tab: 'accounts',
    icon: 'settings-outline',
    inSidemenu: false,
    inTabBar: true,
    showTabBar: true,
  },

  {
    title: 'Support Request',
    tab: 'add-ticket',
    icon: 'home',
    inSidemenu: false,
    inTabBar: false,
    showTabBar: true,
  },
  {
    title: 'Add Claim',
    tab: 'add-claim',
    icon: 'home',
    inSidemenu: false,
    inTabBar: false,
    showTabBar: true,
  },
  {
    title: 'Claims',
    tab: 'claims',
    icon: 'home',
    inSidemenu: false,
    inTabBar: false,
    showTabBar: true,
  },
  {
    title: 'Support View',
    tab: 'support-view',
    icon: 'headset-outline',
    inSidemenu: false,
    inTabBar: false,
    showTabBar: true,
  }
];

/*
 * TABS_ROOT is the root path of all pages, e.g, if you set this
 * to 'app' then all pages start with the path 'app' as in:
 * http://localhost:8100/app/tab1.
 */
export const TABS_ROOT: string = 'home';
export const APP_PAGES: any[] = TAB_PAGES.map((page: any) => {
  page.url = '/' + TABS_ROOT + '/' + page.tab;
  return page;
});

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {


  ngOnInit() {
  }

  public readonly tabBarPages: any =
    TAB_PAGES.filter((page: any) => page.inTabBar);

  @ViewChild('home', { read: ElementRef, static: false })
  private tabBarRef: ElementRef;

  constructor(
    private tabBarService: TabBarService,

  ) { }

  public ngAfterViewInit(): void {
    const pagesShowingTabBar: Set<string> = new Set<string>(
      TAB_PAGES.filter((page: any) => page.showTabBar)
        .map((page: any) => page.tab));
    this.tabBarService.init(this.tabBarRef, pagesShowingTabBar);
  }

}
