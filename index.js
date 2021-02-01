const express = require('express')
const path = require('path');
const sql = require('mssql');
const fs = require('fs');

const app = express()
const port = process.env.PORT || 1337;

app.get('/', (req, res) => {

    const htmlFile = path.join(__dirname + '/index.html')

    fs.readFile(htmlFile, 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }

        data = data.replace('{{title}}', process.env.Pavadinimas);
        
        var config = {
            user: process.env.Sql_User,
            password: process.env.Sql_Password,
            server: process.env.Sql_Server, 
            database: process.env.Sql_Database 
        };

        sql.connect(config, function (err) {
            
            if (err) {
                console.log(err);
                data = data.replace('{{input}}', '<p>Laukiama duomenų bazės...</p>');
                res.send(data);
            }
            else {

                var request = new sql.Request();
    
                request.query('select Id, Name from MyTable', function (err, recordset) {
                
                    if (err) {
                        console.log(err)
                        data = data.replace('{{input}}', '<p>Laukiama lentelės</p>');
                        res.send(data);
                    }
                    else {

                        var tableHtml = 
                        `<table class="rwd-table">
                        <tr>
                          <th>Id</th>
                          <th>Pavadinimas</th>
                        </tr>`

                        recordset.recordset.forEach(property => 
                            {
                                tableHtml += `
                                <tr>
                                  <td data-th="Id">${property.Id}</td>
                                  <td data-th="Name">${property.Name}</td>
                                </tr>`
                            })

                        tableHtml += '</table>'
                        data = data.replace('{{input}}', tableHtml);
                        res.send(data);
                    }  
                });
            }    
        });   
    });
  })

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })

