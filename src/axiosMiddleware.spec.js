import axios from 'axios'
import axiosMiddleware from 'redux-axios-middleware'
import configureMockStore from 'redux-mock-store'
import MockAdapter from 'axios-mock-adapter'

const options = {
  returnRejectedPromiseOnError: true,

  interceptors: {
    request: [
      ({ getState, dispatch }, config) => {
        config.headers['Authorization'] = 'Bearer ' + getState().access_token
        return config
      }
    ],
    response: [
      {
        success: ({ dispatch }, response) => {
         return response
        },
        error: ({ dispatch, getSourceAction }, error) => {
          return Promise.reject(error)
        }
      }
    ]
  }
}

const middleware = axiosMiddleware(axios, options)

describe('axiosMiddleware', () => {
  const client = axios.create({
    responseType: 'json'
  })

  const mockAxiosClient = new MockAdapter(axios)
  const mockStore = configureMockStore([middleware])
  const mockAdapter = mockAxiosClient.adapter()

  afterEach(() => {
    mockAxiosClient.reset()
  })

  afterAll(() => {
    mockAxiosClient.restore()
  })

  it('attaches authorization header on each request', () => {
    let got

    mockAxiosClient.onGet('/test').reply(config => {
      got = config.headers['Authorization']
      return [200]
    })

    const action = () => {
      return {
        type: 'LOAD',
        payload: {
          request: {
            url: '/test'
          }
        }
      }
    }

    const store = mockStore({ access_token: '::access_token::' })

    return store.dispatch(action()).then(() => {
      expect(got).toEqual('Bearer ::access_token::')
    })
  })
  
  
  it('attaches another authorization header on each request', () => {
    let got

    mockAxiosClient.onGet('/test2').reply(config => {
      got = config.headers['Authorization']
      return [200]
    })

    const action = () => {
      return {
        type: 'ANOTHER_LOAD_ACTION',
        payload: {
          request: {
            url: '/test2'
          }
        }
      }
    }

    const store = mockStore({ access_token: '::another_access_token::' })

    return store.dispatch(action()).then(() => {
      expect(got).toEqual('Bearer ::another_access_token::')
    })
  })
})
