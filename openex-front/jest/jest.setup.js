// Default timeout
jest.setTimeout(100000);
jest.mock('../src/actions/Application.js', () => {
  return {
    fetchMe: () => jest.fn(),
    fetchParameters: () => jest.fn(),
  };
});
