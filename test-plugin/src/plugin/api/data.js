var data = 'init data'

function getData() {
  console.log('in get data');
  return data
}

function setData(value) {
  data = value
}

module.exports = {
  getData: getData,
  setData: setData
}