import '@babel/polyfill';
import enhancedFetch from '../src/index';
import fetchMock from 'fetch-mock';

describe('ENHANCED FETCH TESTING', () => {
  it('Status 200', async () => {
    fetchMock.get('http://www.mocky.io/v2/5dd183cd320000600006fabf', {hello: "world"});

    const response = await enhancedFetch.fetch('http://www.mocky.io/v2/5dd183cd320000600006fabf');
    const result = await response.json();

    expect(result.hello).toEqual("world");
  });

  it('Status 404', async () => {
    await fetchMock.get('http://www.mocky.io/v2/5dd18453320000540006fac1', 404);
    const errorHandler = res => {
      if (!res.ok) {
        throw Error(res.status);
      }

      return res;
    };

    let originalFetchError = null;
    let enhancedFetchError = null;

    try {
      await fetch('http://www.mocky.io/v2/5dd18453320000540006fac1').then(errorHandler);
    } catch (e) {
      originalFetchError = e;

      expect(e).toBeInstanceOf(Error);
      expect(e).toEqual(new Error(404));
      expect(e.message).toEqual('404');
    }

    try {
      await enhancedFetch.fetch('http://www.mocky.io/v2/5dd18453320000540006fac1');
    } catch (e) {
      enhancedFetchError = e;

      expect(e).toBeInstanceOf(Error);
      expect(e).toEqual(new Error(404));
      expect(e.message).toEqual('404');
    }

    expect(originalFetchError).toEqual(enhancedFetchError);
  });

  it('Abort request', async () => {
    fetchMock.get('http://www.mocky.io/v2/5dd183cd320000600006fabf?mocky-delay=5000ms', {hello: "world"});

    const test = () => new Promise((resolve, reject) => {
      var fetchInstance = enhancedFetch.createInstance({baseUrl: 'http://www.mocky.io/v2',});
      var abortC = fetchInstance.abortController();

      fetchInstance.fetch('/5dd183cd320000600006fabf?mocky-delay=5000ms', {
        signal: abortC.signal,
        method: 'GET',
        mode: "cors",
      }, 10000,)
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(err => {
          reject(err);
        });

      abortC.abort()
    });

    try {
      await test();
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect(e.name).toEqual('AbortError');
    }
  })
});
