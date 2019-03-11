/**
 * Library for storing data and editing data
 * 
 */
 //Depencies
 const fs = require('fs');
 const path = require('path');
 const helpers = require('./helpers');

 //Container for this module
 const database = {};
 database.realFilePath = path.join(__dirname, '/../.data')

 database.create = (dir, file, data, callback) => {
    //Open file for writing
    fs.open(`${database.realFilePath}/${dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
        if(!err && fileDescriptor){
            //Convert Data to  string
            let stringData = JSON.stringify(data);

            //Write to file and Close
            fs.writeFile(fileDescriptor, stringData, (err) => {
                if(!err) {
                    fs.close(fileDescriptor, (err) => {
                        if(!err) {
                        callback('Successfuly created',false)
                        } else{
                            callback('Error closing file', err);
                        }
                    });
                } else{
                    callback('Error writing to file')
                }
            })
        } else{
            callback('Could not create new file it may already exit', err)
        }
    })
 };


 //Reading from the database
 database.read = (dir, file, callback) => {
     fs.open(`${database.realFilePath}/${dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
        if(!err) {
            //read data from data store
            fs.readFile(fileDescriptor, 'utf8', (err, data) => {
                if(!err) {
                    //Parse JSON data to Object
                    data = JSON.parse(data);

                    //Close file after a successful read
                    fs.close(fileDescriptor, (err) => {
                        if(!err) {
                            callback(false, data);
                        } else{
                            callback(err);
                        }
                    });
                } else{
                    callback(err, {Error: 'Error reading file'});
                }
                
            });

        } else{
            callback(err, {Error : 'Error opening file to read'});
        }
     });
 }


 //Updating the database
 database.update = (dir, file, data, callback) => {
     //Open file for updating
     fs.open(`${database.realFilePath}/${dir}/${file}.json`, 'w', (err, fileDescriptor) => {
        if(!err && fileDescriptor) {
            //Parse data to string
            data = JSON.stringify(data); 
            fs.writeFile(fileDescriptor, data, (err) => {
                if(!err) {
                    //Close file stream
                    fs.close(fileDescriptor, (err) => {
                        if(!err){
                            callback(`File ${dir}.${file} updated'`)
                        } else{
                            callback('Error occured closing file', err)
                        }
                    })
                } else{
                    callback('Error updating file', err)
                }
            })
        } else{
            callback('Error opening file', err)
        }
        
     })
 }

 //Deleting from the Database
 database.delete = (dir, file, callback) => {

    //Delete the file
     fs.unlink(`${database.realFilePath}/${dir}/${file}.json`, (err) => {
         if(!err) {
             callback('Table deleted succesfully');
         } else{
             callback('Error deleting table', err);
         }
     });
 };

 //  List all the item in a directory
 database.list = (dir, callback) =>{
    //  Get the whole files from the directory
    fs.readdir(`${database.realFilePath}/${dir}/`, (err, data) => {
        if(!err && data && data.length > 0) {
            let trimmedFileNames = [];
            data.forEach((fileName) => {
                trimmedFileNames.push(fileName.replace('.json', ''));
            });
            callback(false, trimmedFileNames);
        } else{
            callback(err, data)
        }
    }); 
 }

 //Export database
 module.exports = database; 