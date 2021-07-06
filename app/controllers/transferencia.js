let mysql = require('../../db/mysql');
let branch = require('../models/branch');

module.exports = {
   transferencia:(req,res)=>{
      mysql.beginTransaction((error)=> {
         if(error){
            res.json(error);
         }// end ifcycle
         else{
            let cliente_id_retiro = req.body.cliente_id_retiro;
            let cliente_id_deposito = req.body.cliente_id_deposito;
            let cuenta_id_retiro = req.body.cuenta_id_retiro;
            let cuenta_id_deposito = req.body.cuenta_id_deposito;
            let fecha = req.body.fecha;
            let monto = req.body.monto; 

            mysql.query(`select * from cuentas where id=${cuenta_id_retiro} and clientes_id=${cliente_id_retiro}`, (err,rows,fields)=>{
               if(rows[0]!=null){
                  mysql.query(`select * from cuentas where id=${cuenta_id_deposito} and clientes_id=${cliente_id_deposito}`, (errFind,rowsFind,fieldsFind)=>{
                  if(!errFind){
                     mysql.query(`update cuentas set saldo={saldo-${monto}} where cuentas_id=${cuenta_id_retiro}`, (errUpdateRetiro,rowsUpdateRetiro,fieldsUpdateRetiro)=>{
                        if(errUpdateRetiro){
                           mysql.rollback((errUpdateRetiro)=>{
                           res.json(errUpdateRetiro);
                        })// end rollback
                        }//end if
                        else{//modifico el saldo del deposito
                           mysql.query(`update cuentas set saldo={saldo+${monto}} where cuentas_id=${cuenta_id_deposito}`, (errUpdateDeposito,rowsUpdateDeposito,fieldsUpdateDeposito)=>{
                              if(errUpdateDeposito){
                                 mysql.rollback((errUpdateDeposito)=>{
                                 res.json(errUpdateDeposito);
                                 })//end rollback
                              }//end if
                              else{
                                  //mysql para update
                                  mysql.query(`update cuentas set saldo={saldo+${monto}} where cuentas_id=${cuenta_id_deposito}`, (errUpdateDeposito,rowsUpdateDeposito,fieldsUpdateDeposito)=>{
                                    if(errUpdateDeposito){
                                       mysql.rollback((errUpdateDeposito)=>{
                                       res.json(errUpdateDeposito);
                                       })//end rollback
                                    }//end if
                                    else{
                                       mensaje= {status:'ok',mensaje:'La transferencia fue realizada exitosamente'}
                                       mysql.commit((errUpdateDeposito)=>{ //al termino se realiza un commit para guardar todos los cambios
                                       if(errUpdateDeposito){
                                          res.json(errUpdateDeposito);
                                       }//end if
                                       else{
                                          res.json(mensaje);
                                       }//end else
                                       })//end commit
                                    }//end else
                                 })//end query
                              }//end else
                                 })//end query
                              }//end else
                           })//end query
                        }//end if
                        else{//modifico el saldo del deposito
                            res.status(404).json({Mensaje: `No se encontró la cuenta a la cual se quiere depositar`, Error: `${err}`});
                         }//end else 
                     })//end query
                    }//end if
                    else{
                        res.status(404).json({Mensaje: `No se encontró la cuenta de la cual se quiere retirar`, Error: `${err}`});
                    }
                     
           })
        }//end else
        
        })//end query
         }//end else
        }//end transaction