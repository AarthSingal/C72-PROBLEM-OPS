import React from 'react';
import { StyleSheet, Text, View , TouchableOpacity , TextInput, Image, KeyboardAvoidingView, ToastAndroid} from 'react-native';
import {BarCodeScanner} from 'expo-barcode-scanner'
import * as Permissions from 'expo-permissions'
import * as firebase from 'firebase';
import db from '../config';
export default class BookTransactionScreen extends React.Component {
  constructor(){
    super();
    this.state = {
      hasCameraPermissions : null,
      scanned : false,
      buttonState : 'normal',
      scannedBookId :'',
      scannedStudentId :'',
      transactionMessage:''
    }
  }
  getCameraPermission=async (Id)=>{
    const {status}=await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermissions : status === "granted",
      buttonState : Id,
      scanned : false
    })
  }
  handleBarcodeScanned= async({type,data})=>{
    const {buttonState}=this.state.buttonState

    if(buttonState==="BookId"){
    this.setState({
      scanned : true,
      buttonState : 'normal',
      scannedBookId : data,
    })}else if(buttonState==="StudentId"){
      this.setState({
        scanned : true,
        buttonState : 'normal',
        scannedStudentId : data,
      })
    }
  }
  initiateBookIssue = async()=>{
    db.collection("transactions").add({
      studentId : this.state.scannedStudentId,
      bookId : this.state.scannedBookId,
      date : firebase.firestore.Timestamp.now().toDate(),
      transactionType : "issue"
    })
    db.collection("books").doc(this.state.scannedBookId).update({
      bookAvialibility : false
    })
    db.collection("students").doc(this.state.scannedStudentId).update({
      numberOfBooksIssued : firebase.firestore.FieldValue.increment(1)
    })
    this.setState({
      scannedBookId : '',
      scannedStudentId : ''
    })
  }
  initiateBookReturn = async()=>{
    db.collection("transactions").add({
      studentId : this.state.scannedStudentId,
      bookId : this.state.scannedBookId,
      date : firebase.firestore.Timestamp.now().toDate(),
      transactionType : "return"
    })
    db.collection("books").doc(this.state.scannedBookId).update({
      bookAvialibility : true
    })
    db.collection("students").doc(this.state.scannedStudentId).update({
      numberOfBooksIssued : firebase.firestore.FieldValue.increment(-1)
    })
    this.setState({
      scannedBookId : '',
      scannedStudentId : ''
    })
  }
  handleTransaction=async()=>{
    var transactionMessage;
    db.collection("books").doc(this.state.scannedBookId).get()
    .then((doc)=>{
      var book = doc.data()
      //console.log(book);
      if(book.bookAvialibility){
        this.initiateBookIssue()
        transactionMessage = "Book Issued"
        alert(transactionMessage)
        //ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)
      }else{
        this.initiateBookReturn()
        transactionMessage = "Book Return"
        alert(transactionMessage)
        //ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)
      }
    })
    this.setState({
      transactionMessage:transactionMessage
    })
  }
  render (){
    const hasCameraPermissions = this.state.hasCameraPermissions
    const scanned = this.state.scanned
    const buttonState = this.state.buttonState

    if(buttonState !== 'normal' && hasCameraPermissions){
      return (
        <BarCodeScanner 
        onBarCodeScanned={scanned?
        undefined:
      this.handleBarcodeScanned}
      style = {StyleSheet.absoluteFillObject}/>
      )
    }else if(buttonState === 'normal'){
  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
      <View>
        <Image source={require('../assets/booklogo.jpg')} style = {{width:200,height:200}}/>
        <Text style = {{textAlign:"center",fontSize:30}}>Wily</Text>
      </View>
      <View style={styles.inputView}>
        <TextInput placeholder="Book Id" style={styles.inputBox}
        onChangeText={(text)=>{
          this.setState({
            scannedBookId : text
          })
        }}
        value = {this.state.scannedBookId}/>
        <TouchableOpacity style={styles.scanButton} 
        onPress ={()=>{
          this.getCameraPermission("BookId")
        }}>
          <Text style={styles.buttonText}>Scan</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.inputView}>
        <TextInput placeholder="Student Id" style={styles.inputBox}
        onChangeText={(text)=>{
          this.setState({
            scannedStudentId : text
          })
        }}
        value = {this.state.scannedStudentId}/>
        <TouchableOpacity style={styles.scanButton}
        onPress={()=>{
          this.getCameraPermission("StudentId")
        }}>
          <Text style={styles.buttonText}>Scan</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style ={styles.submitButton} onPress={()=>{
        this.handleTransaction()
        /*this.setState({
          scannedBookId :'',
          scannedStudentId :''
        })*/
      }}>
        <Text style = {styles.submitButtonText}>
          Submit
        </Text>
        </TouchableOpacity>
    </KeyboardAvoidingView>
  )}}
}
const styles = StyleSheet.create({
  container:{
    flex : 1,
    justifyContent:"center",
    alignItems : "center"
  },
  displayText:{
    fontSize : 15,
    textDecorationLine : 'underline'
  },
  scanButton:{
    backgroundColor : "yellow",
    width:50,
    borderWidth:1.5,
    borderLeftWidth:0
  },
  buttonText:{
    fontSize : 15,
    textAlign:"center",
    marginTop : 10
  },
  inputView:{
    flexDirection:"row",
    margin : 20
  },
  inputBox :{
    width:200,
    height:40,
    borderWidth:1.5,
    borderRightWidth :0,
    fontSize:20
  },
  submitButton:{
    backgroundColor:"green",
    width:100,
    height:50
  },
  submitButtonText:{
    padding:10,
    textAlign:"center",
    fontSize : 20,
    fontWeight:"bold",
    color : "white"
  }
})


