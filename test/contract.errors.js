const assert = require('assert');
const Eth = require('../packages/web3-eth');
const FakeIpcProvider = require('./helpers/FakeIpcProvider');

const abi = [{
    name: "simpleMethod",
    payable: false,
    constant: true,
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "a", type: "bytes32" }],
    outputs: [{ name: "b", type: "bytes32" }],
}];

describe('contract: errors', function () {
    let provider;
    let eth;

    before(function(){
        provider = new FakeIpcProvider();
        eth = new Eth(provider);
    })

    it('errors when no ABI is provided / ABI is not array', function () {
        const expected = 'You must provide the json interface of the ' +
                         'contract when instantiating a contract object.';

        // Existence check
        try {
            new eth.Contract();
            assert.fail();
        } catch(err){
            assert(err.message.includes(expected));
        }

        // Array check
        try {
            new eth.Contract({});
            assert.fail();
        } catch(err){
            assert(err.message.includes(expected));
        }
    })

    it('errors when event listener is not provided with callback', function(){
        const expected = 'Once requires a callback as the second parameter';
        const contract = new eth.Contract(abi);

        try {
            contract.once('data');
            assert.fail();
        } catch(err){
            assert(err.message.includes(expected));
        }
    })

    it('errors when a non-existant event is listened for', function(){
        const expected = 'Event "void" doesn\'t exist in this contract';
        const contract = new eth.Contract(abi);

        try {
            contract.once('void', () => {});
            assert.fail();
        } catch(err){
            assert(err.message.includes(expected));
        }
    })

    it('errors when listening for event without setting address', function(){
        const expected = 'This contract object doesn\'t have address set yet, ' +
                         'please set an address first';

        const eventAbi = [{
            "anonymous": false,
            "inputs": [],
            "name": "BasicEvent",
            "type": "event"
        }];

        const contract = new eth.Contract(eventAbi);

        try {
            contract.once('BasicEvent', () => {});
            assert.fail();
        } catch(err){
            assert(err.message.includes(expected));
        }
    })

    it('errors when an event name is reserved', function(){
        const expected = 'The event "newListener" is a reserved event name, ' +
                         'you can\'t use it.';

        const newListenerEventAbi = [{
            "anonymous": false,
            "inputs": [],
            "name": "newListener",
            "type": "event"
        }];

        const address = '0xEE221E529cF6DB20179E7bAeb4442e9CbdCa83d7';
        const contract = new eth.Contract(newListenerEventAbi, address);

        try {
            contract.once('newListener', () => {});
            assert.fail();
        } catch(err){
            assert(err.message.includes(expected));
        }
    })

    it('errors when deploy is called without data', function(done){
        const expected = 'No "data" specified in neither the given options, ' +
                         'nor the default options.';

        const newAbi = [{
          "inputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "constructor"
        }];

        const contract = new eth.Contract(newAbi);

        // Thrown error format
        try {
            contract.deploy();
            assert.fail();
        } catch(err){
            assert(err.message.includes(expected));
        }

        // Callback format
        contract.deploy({}, function(err){
            assert(err.message.includes(expected));
            done();
        });
    })

    it('errors when send is called without a contract address set', function(){
        const expected = 'This contract object doesn\'t have address set yet, ' +
                         'please set an address first.';

        const contract = new eth.Contract(abi);
        try {
            contract.methods.simpleMethod("0xaaa").send();
            assert.fail();
        } catch(err){
            assert(err.message.includes(expected));
        }
    });

    it('errors when send is called without a from address being set', async function(){
        const expected = 'No "from" address specified in neither the given options, '
                         'nor the default options.';

        const address = '0xEE221E529cF6DB20179E7bAeb4442e9CbdCa83d7';
        const contract = new eth.Contract(abi, address);
        try {
            await contract.methods.simpleMethod("0xaaa").send({});
            assert.fail();
        } catch(err){
            assert(err.message.includes(expected));
        }
    });
});