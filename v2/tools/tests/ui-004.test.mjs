import {test} from 'node:test';
import assert from 'node:assert/strict';
import {localPreviewAmount,initLocalFundraisingPreview} from '../../fundraising-preview.mjs';

test('local preview requires an explicit valid amount on loopback hosts',()=>{
  for(const host of ['127.0.0.1','localhost','[::1]']){
    for(const [query,expected] of [['',null],['?fundraisingPreview=100000',100000],['?fundraisingPreview=0',0],['?fundraisingPreview=',null],['?fundraisingPreview=-1',null],['?fundraisingPreview=NaN',null],['?fundraisingPreview=100.5',null],['?fundraisingPreview=1000000000000',null]]){
      assert.equal(localPreviewAmount(new URL(`http://${host}:8766/v2/${query}`)),expected);
    }
  }
});
test('a query cannot activate preview on a deployed or deceptive host',()=>{
  for(const host of ['benzenzz.github.io','poet.org','localhost.example.org','127.0.0.1.example.org','192.168.1.5'])assert.equal(localPreviewAmount(new URL(`https://${host}/v2/?fundraisingPreview=100000`)),null);
});
test('fixture updates only the Home displayed raised value and adds an explicit label',()=>{
  const dataset={raised:'78450000',target:'121950000',provisional:'true'};
  let inserted,description;
  const scope={querySelector(selector){assert.equal(selector,'[data-fund-animate]');return {dataset,querySelector(){return {after(note){inserted=note;}};},setAttribute(name,value){description=[name,value];}};},createElement(){return {};}};
  assert.equal(initLocalFundraisingPreview(scope,new URL('http://127.0.0.1:8766/v2/?fundraisingPreview=100000')),true);
  assert.deepEqual(dataset,{raised:'100000',target:'121950000',provisional:'true',localPreview:'true'});
  assert.equal(inserted.textContent,'Dữ liệu xem thử');
  assert.deepEqual(description,['aria-describedby','local-fund-preview-note']);
  assert.equal(initLocalFundraisingPreview({querySelector(){throw Error('Must not touch default DOM');}},new URL('http://localhost:8766/v2/')),false);
});
