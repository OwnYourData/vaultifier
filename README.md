# Vaultifier

A js-library to interact with the [OwnYourData Data-Vault](https://data-vault.eu)

**IMPORTANT:** This library is under development. Expect the API to change at any time, without me writing a personal letter to you in beforehand. Even without changing the version number.

## Example

```javascript
import { Vaultifier } from 'vaultifier/build/module

const vaultifier = new Vaultifier(
  'https://data-vault.eu',
  Vaultifier.getRepositoryPath('eu', 'ownyourdata', 'testplugin'), // results in "eu.ownyourdata.testplugin"
  'app_key',
  'super_secret',
);

// authenticate Vaultifier against data-vault
await vaultifier.initialize();
// enable end-to-end encryption
await vaultifier.setEnd2EndEncryption(true);

// send data to data vault
await vaultifier.postData({
  foo: 'bar',
});
```

## Install

As currently, there is no npm package available on npmjs.com, the only way is to install this library through github

`npm install github:OwnYourData/vaultifier`
