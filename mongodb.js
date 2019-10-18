var Mongo = require('mongodb').MongoClient
var _ = require('lodash')

module.exports = function (options) {
  // console.log(options)
  var opts = this.opts = _.defaultsDeep(options, {
    url: 'mongodb://url:Yplsec.com@192.168.1.118:20012,192.168.1.119:20011/WhiteURL?replicaSet=cloud'
    // url: 'mongodb://cms:Yplsec.com@10.0.0.5:20011,10.0.0.6:20011/cms?replicaSet=cloud'
  })
  this.init = function (cb) {
    var self = this
    Mongo.connect(opts.url, function (err, db) {
      if (err) {
        self.error('init', err)
        return
      }
      self.db = db
      self.changeCollection(opts.connection)
      cb && cb.bind(self)(db)
      // db.close()
    })
  }

  this.changeCollection = function (connStr) {
    this.collection = this.db.collection(connStr)
  }

  this.insert = function (obj, cb) {
    var self = this
    self.collection.insert(obj, function (err, result) {
      if (err) {
        self.error('insert', err)
        return
      }
      cb && cb.bind(self)(result)
    })
  }

  this.find = function (obj, m, cb) {
    var self = this
    self.collection.find(obj).limit(m).toArray(function (err, result) {
      if (err) {
        self.error('find', err)
        return
      }
      cb && cb.bind(self)(result)
    })
  }

  this.update = function (whereData, updateDat, cb) {
    var self = this
    self.collection.update(whereData, updateDat, function (err, result) {
      if (err) {
        self.error('update', err)
        return
      }
      cb && cb.bind(self)(result)
    })
  }

  this.updateMany = function (whereData, updateDat, cb) {
    var self = this
    self.collection.updateMany(whereData, updateDat, function (err, result) {
      if (err) {
        self.error('updateMany', err)
        return
      }
      cb && cb.bind(self)(result)
    })
  }

  this.insertMany = function (data, cb) {
    var self = this
    self.collection.insertMany(data, function (err, result) {
      if (err) {
        self.error('insertMany', err)
        return
      }
      cb && cb(result)
    })
  }

  this.deleteOne = function (data, cb) {
    var self = this
    self.collection.deleteOne(data, function (err, result) {
      if (err) {
        self.error('deleteOne', err)
        return
      }
      cb && cb(result)
    })
  }

  this.error = function (log, tag) {
    console.log('error', log, tag)
  }

  return this
}
