# OpenBAS Frontend

[![Website](https://img.shields.io/badge/website-openbas.io-blue.svg)](https://filigran.io/)
[![Slack Status](https://img.shields.io/badge/slack-3K%2B%20members-4A154B)](https://community.filigran.io)

The following repository is used to store the OpenBAS frontend module.

## Launch e2e tests

First, you need to install Playwright browsers and dependencies:
```
yarn playwright install
```

Then, you can launch several e2e command line:
```
    # Run tests
    yarn test:e2e

    # Run tests in UI mode
    yarn test:e2e:ui
    
    # Run the test generator
    yarn generate-test-e2e
    
    # Build coverage report
    yarn test:e2e:coverage
```

## License

**Unless specified otherwise**, openbas-front are released under the [Apache 2.0](https://github.com/OpenBAS-Platform/injectors/blob/master/LICENSE).

## About

OpenBAS is a product designed and developed by the company [Filigran](https://filigran.io).

<a href="https://filigran.io" alt="Filigran"><img src="https://filigran.io/wp-content/uploads/2023/08/filigran_text_medium.png" width="200" /></a>
