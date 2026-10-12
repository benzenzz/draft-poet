import { createHmac } from 'node:crypto';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

function sortObjDataByKey(object) {
  return Object.keys(object)
    .sort()
    .reduce((obj, key) => {
      obj[key] = object[key];
      return obj;
    }, {});
}

function convertObjToQueryStr(object) {
  return Object.keys(object)
    .filter((key) => object[key] !== undefined)
    .map((key) => {
      let value = object[key];
      if (value && Array.isArray(value)) {
        value = JSON.stringify(value.map((val) => sortObjDataByKey(val)));
      }
      if ([null, undefined, 'undefined', 'null'].includes(value)) {
        value = '';
      }
      return `${key}=${value}`;
    })
    .join('&');
}

function signDataObject(data, checksumKey) {
  const sorted = sortObjDataByKey(data);
  const query = convertObjToQueryStr(sorted);
  return createHmac('sha256', checksumKey).update(query).digest('hex');
}

describe('PayOS webhook signature', () => {
  it('accepts the official test vector', () => {
    const checksumKey = '1a54716c8f0efb2744fb28b6e38b25da7f67a925d98bc1c18bd8faaecadd7675';
    const data = {
      orderCode: 123,
      amount: 3000,
      description: 'VQRIO123',
      accountNumber: '12345678',
      reference: 'TF230204212323',
      transactionDateTime: '2023-02-04 18:25:00',
      currency: 'VND',
      paymentLinkId: '124c33293c43417ab7879e14c8d9eb18',
      code: '00',
      desc: 'Thành công',
      counterAccountBankId: '',
      counterAccountBankName: '',
      counterAccountName: '',
      counterAccountNumber: '',
      virtualAccountName: '',
      virtualAccountNumber: '',
    };
    const expected = '412e915d2871504ed31be63c8f62a149a4410d34c4c42affc9006ef9917eaa03';
    assert.equal(signDataObject(data, checksumKey), expected);
  });

  it('treats null as empty string', () => {
    const checksumKey = '1a54716c8f0efb2744fb28b6e38b25da7f67a925d98bc1c18bd8faaecadd7675';
    const withNull = { amount: 1, note: null, orderCode: 2 };
    const withEmpty = { amount: 1, note: '', orderCode: 2 };
    assert.equal(signDataObject(withNull, checksumKey), signDataObject(withEmpty, checksumKey));
  });
});
