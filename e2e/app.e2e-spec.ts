import { WaterusePage } from './app.po';

describe('wateruse App', () => {
  let page: WaterusePage;

  beforeEach(() => {
    page = new WaterusePage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
