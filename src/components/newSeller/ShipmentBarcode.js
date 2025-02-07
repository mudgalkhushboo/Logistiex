/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  NativeBaseProvider,
  Image,
  Box,
  Fab,
  Icon,
  Button,
  Modal,
  Input,
} from 'native-base';
import React, {useEffect, useState, useRef} from 'react';
import axios from 'axios';
import {
  Text,
  View,
  ScrollView,
  Vibration,
  ToastAndroid,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import {Center} from 'native-base';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera} from 'react-native-camera';
import {openDatabase} from 'react-native-sqlite-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import NetInfo from '@react-native-community/netinfo';
import RNBeep from 'react-native-a-beep';
import {Picker} from '@react-native-picker/picker';
import GetLocation from 'react-native-get-location';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import OTPTextInput from 'react-native-otp-textinput';

const db = openDatabase({
  name: 'rn_sqlite',
});

const ShipmentBarcode = ({route}) => {
  const [expected, setExpected] = useState(0);
  const [newaccepted, setnewAccepted] = useState(0);
  const [newrejected, setnewRejected] = useState(0);
  const [newNotPicked, setNewNotPicked] = useState(0);
  const [barcode, setBarcode] = useState('');
  const [len, setLen] = useState(0);
  const [DropDownValue, setDropDownValue] = useState('');
  const [rejectedData, setRejectedData] = useState([]);
  const [acceptedArray, setAcceptedArray] = useState([]);
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [bagId, setBagId] = useState('');
  const [bagIdNo, setBagIdNo] = useState(1);
  const [showCloseBagModal, setShowCloseBagModal] = useState(false);
  const [showCloseBagModal11, setShowCloseBagModal11] = useState(false);
  const [bagSeal, setBagSeal] = useState('');

  const buttonColor = acceptedArray.length === 0 ? 'gray.300' : '#004aad';
  var otpInput = useRef(null);
  const [name, setName] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [mobileNumber, setMobileNumber] = useState(route.params.phone);
  const [showModal11, setShowModal11] = useState(false);
  const [modalVisible11, setModalVisible11] = useState(false);
  const [DropDownValue11, setDropDownValue11] = useState('');
  const [PartialCloseData, setPartialCloseData] = useState([]);
  const [closeBagColor, setCloseBagColor] = useState('gray.300');
  const [showQRCodeModal, setShowQRCodeModal] = useState(true);

  const currentDate = new Date().toISOString().slice(0, 10);
  let serialNo = 0;

  const [scanned, setScanned] = useState(true);
  const scannerRef = useRef(null);

  const reloadScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.reactivate();
    }
  };
  useEffect(() => {
    reloadScanner();
  }, []);
  const DisplayData11 = async () => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM PartialCloseReasons', [], (tx1, results) => {
        let temp = [];
        // console.log(results.rows.length);
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
        }
        // console.log('Data from Local Database partialClosure : \n ', temp);
        setPartialCloseData(temp);
        // console.log('Table6 DB OK:', temp.length);
      });
    });
  };
  useEffect(() => {
    DisplayData11();
  }, []);
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      displayDataSPScan();
    });
    return unsubscribe;
  }, [navigation]);
  // useEffect(() => {
  //   partialClose112();
  // }, []);

  const displayDataSPScan = async () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Pickup" AND consignorCode=?  AND status="accepted"',
        [route.params.consignorCode],
        (tx1, results) => {
          setnewAccepted(results.rows.length);
        },
      );
    });
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Pickup" AND consignorCode=? AND status="notPicked"',
        [route.params.consignorCode],
        (tx1, results) => {
          setNewNotPicked(results.rows.length);
        },
      );
    });
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Pickup" AND consignorCode=? AND status="rejected"',
        [route.params.consignorCode],
        (tx1, results) => {
          setnewRejected(results.rows.length);
        },
      );
    });
  };

  const partialClose112 = () => {
    console.log('partialClose popup shown11');
    if (newaccepted + newrejected === route.params.Forward) {
      console.log(newaccepted);
      // sendSmsOtp();
      navigation.navigate('POD', {
        Forward: route.params.Forward,
        accepted: newaccepted,
        rejected: newrejected,
        notPicked: newNotPicked,
        phone: route.params.phone,
        userId: route.params.userId,
        DropDownValue: DropDownValue11,
        consignorCode: route.params.consignorCode,
        contactPersonName: route.params.contactPersonName,
        runsheetno: route.params.PRSNumber,
        latitude: latitude,
        longitude: longitude,
      });
    } else {
      setDropDownValue11('');
      setModalVisible11(true);
    }
  };

  // const clearText = () => {
  //   otpInput.current.clear();
  // }

  // const setText = () => {
  //   otpInput.current.setValue("1234");
  // }

  useEffect(() => {
    current_location();
  }, []);

  const current_location = () => {
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    })
      .then(location => {
        setLatitude(location.latitude);
        setLongitude(location.longitude);
      })
      .catch(error => {
        RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
          interval: 10000,
          fastInterval: 5000,
        })
          .then(status => {
            if (status) {
              console.log('Location enabled');
            }
          })
          .catch(err => {
            console.log(err);
          });
        console.log('Location Lat long error', error);
      });
  };

  const sendSmsOtp = async () => {
    console.log(mobileNumber);
    const response = await axios
      .post('https://bkedtest.logistiex.com/SMS/msg', {
        mobileNumber: mobileNumber,
      })
      .then(setShowModal11(true))
      .catch(err => console.log('OTP not send'));
    // if (response.status === 200) {
    //   setShowModal11(true);
    // }
    // else {
    //   console.log('Otp not send', response);
    // }
  };

  function handleButtonPress11(item) {
    if (item === 'Partial Dispatch') {
      setDropDownValue11('');
      setModalVisible11(false);
      navigation.navigate('Dispatch', {
        consignorCode: route.params.consignorCode,
      });
    }
    setDropDownValue11(item);
    // setModalVisible11(false);
  }

  function validateOTP() {
    axios
      .post('https://bkedtest.logistiex.com/SMS/OTPValidate', {
        mobileNumber: mobileNumber,
        otp: inputOtp,
      })
      .then(response => {
        if (response.data.return) {
          // submitForm11();
          setInputOtp('');
          setShowModal11(false);
          ToastAndroid.show('Submit successful', ToastAndroid.SHORT);
          navigation.navigate('Main', {
            userId: route.params.userId,
          });
        } else {
          alert('Invalid OTP, please try again !!');
        }
      })
      .catch(error => {
        alert('Invalid OTP, please try again !!');
        console.log(error);
      });
  }

  // useEffect(() => {
  //   setBagId();
  // }, [bagId]);

  // useEffect(() => {
  //       updateDetails2();
  //       console.log("fdfdd "+barcode);
  // });

  function CloseBagEndScan() {
    partialClose112();
    console.log(bagSeal);
    console.log(acceptedArray);
    let date = new Date().getDate();
    let month = new Date().getMonth() + 1;
    let year = new Date().getFullYear();
    let date11 = date + '' + month + '' + year;
    // console.log(route.params.userId + date11 + bagIdNo);
    let bagId11 = route.params.userId + date11 + bagIdNo;
    setBagId(route.params.userId + date11 + bagIdNo);
    console.log(bagId);

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM closeBag1 ',
        [],
        (tx, results) => {
          console.log(results.rows.length);
          serialNo = results.rows.length + 1;
          const bagID =
            route.params.userId + currentDate + (results.rows.length + 1);
          console.log(bagID);
          console.log(results);
          tx.executeSql(
            'INSERT INTO closeBag1 (bagSeal, bagId, bagDate, AcceptedList,status,consignorCode) VALUES (?, ?, ?, ?,?,?)',
            [
              bagSeal,
              route.params.userId +
                '-' +
                currentDate +
                '-' +
                (results.rows.length + 1),
              currentDate,
              JSON.stringify(acceptedArray),
              'scanPending',
              route.params.consignorCode,
            ],
            (tx, results11) => {
              console.log('Row inserted successfully');
              setBagIdNo(bagIdNo + 1);
              setAcceptedArray([]);
              setBagSeal('');
              console.log('\n Data Added to local db successfully closeBag');
              ToastAndroid.show('Bag closed successfully', ToastAndroid.SHORT);
              console.log(results11);
              viewDetailBag();
            },
            error => {
              console.log('Error occurred while inserting a row:', error);
            },
          );
        },
        error => {
          console.log(
            'Error occurred while generating a unique bag ID:',
            error,
          );
        },
      );
    });
  }

  function CloseBag() {
    console.log(bagSeal);
    console.log(acceptedArray);
    let date = new Date().getDate();
    let month = new Date().getMonth() + 1;
    let year = new Date().getFullYear();
    let date11 = date + '' + month + '' + year;
    // console.log(route.params.userId + date11 + bagIdNo);
    let bagId11 = route.params.userId + date11 + bagIdNo;
    setBagId(route.params.userId + date11 + bagIdNo);
    console.log(bagId);

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM closeBag1 ',
        [],
        (tx, results) => {
          console.log(results.rows.length);
          serialNo = results.rows.length + 1;
          const bagID =
            route.params.userId + currentDate + (results.rows.length + 1);
          console.log(bagID);
          console.log(results);

          tx.executeSql(
            'INSERT INTO closeBag1 (bagSeal, bagId, bagDate, AcceptedList,status,consignorCode) VALUES (?, ?, ?, ?,?,?)',
            [
              bagSeal,
              route.params.userId +
                '-' +
                currentDate +
                '-' +
                (results.rows.length + 1),
              currentDate,
              JSON.stringify(acceptedArray),
              'scanPending',
              route.params.consignorCode,
            ],
            (tx, results11) => {
              console.log('Row inserted successfully');
              setBagIdNo(bagIdNo + 1);
              setAcceptedArray([]);
              setBagSeal('');
              console.log('\n Data Added to local db successfully closeBag');
              ToastAndroid.show('Bag closed successfully', ToastAndroid.SHORT);
              console.log(results11);
              viewDetailBag();
            },
            error => {
              console.log('Error occurred while inserting a row:', error);
            },
          );
        },
        error => {
          console.log(
            'Error occurred while generating a unique bag ID:',
            error,
          );
        },
      );
    });
  }
  const viewDetailBag = () => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM closeBag1', [], (tx1, results) => {
        let temp = [];
        console.log(results.rows.length);
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
        }
        // ToastAndroid.show("Sync Successful",ToastAndroid.SHORT);
        console.log(
          'Data from Local Database : \n ',
          JSON.stringify(temp, null, 4),
        );
        // console.log('Table1 DB OK:', temp.length);
      });
    });
  };
  useEffect(() => {
    createTableBag1();
  }, []);

  const createTableBag1 = () => {
    db.transaction(tx => {
      // tx.executeSql('DROP TABLE IF EXISTS closeBag1', []);
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS closeBag1 (bagSeal TEXT PRIMARY KEY, bagId TEXT, bagDate TEXT, AcceptedList TEXT,status TEXT,consignorCode Text)',
        [],
        (tx, results) => {
          console.log('Table created successfully');
        },
        error => {
          console.log('Error occurred while creating the table:', error);
        },
      );
    });
  };
  const updateDetails2 = () => {
    console.log('scan ' + barcode.toString());
    setAcceptedArray([...acceptedArray, barcode.toString()]);
    console.log(acceptedArray);
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE SellerMainScreenDetails SET status="accepted", eventTime=?, latitude=?, longitude=? WHERE  consignorCode=? AND (awbNo=? OR clientRefId=? OR clientShipmentReferenceNumber=?) ',
        [
          new Date().valueOf(),
          latitude,
          longitude,
          route.params.consignorCode,
          barcode,
          barcode,
          barcode,
        ],
        (tx1, results) => {
          let temp = [];
          console.log('Results', results.rowsAffected);

          if (results.rowsAffected > 0) {
            console.log(barcode + 'accepted');
            displayDataSPScan();
            // ToastAndroid.show(barcode + ' Accepted',ToastAndroid.SHORT);
          } else {
            console.log(barcode + 'not accepted');
          }
          console.log(results.rows.length);
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i));
          }
          // console.log("Data updated: \n ", JSON.stringify(temp, null, 4));
          // viewDetails2();
        },
      );
    });
  };

  const barcodeCheck11 = () => {
    db.transaction(tx => {
      tx.executeSql(
        'Select * FROM SellerMainScreenDetails WHERE status IS NOT NULL AND (awbNo=? OR clientRefId=? OR clientShipmentReferenceNumber=?)',
        [barcode, barcode, barcode],
        (tx1, results) => {
          console.log('Results121', results.rows.length);
          console.log(barcode);
          if (results.rows.length === 0) {
            ToastAndroid.show('Scanning wrong product', ToastAndroid.SHORT);
          } else {
            ToastAndroid.show(barcode + ' already scanned', ToastAndroid.SHORT);
          }
        },
      );
    });
  };

  const rejectDetails2 = () => {
    console.log('scan 45456');

    db.transaction(tx => {
      tx.executeSql(
        'UPDATE SellerMainScreenDetails SET status="rejected" ,rejectionReasonL1=?  WHERE status="accepted" AND consignorCode=? AND (awbNo=? OR clientRefId=? OR clientShipmentReferenceNumber=?) ',
        [DropDownValue, route.params.consignorCode, barcode, barcode, barcode],
        (tx1, results) => {
          let temp = [];
          // ContinueHandle11();
          // console.log("ddsds4545",tx1);
          console.log('Rejected Reason : ', DropDownValue);
          console.log('Results', results.rowsAffected);
          console.log(results);
          if (results.rowsAffected > 0) {
            // ContinueHandle11();
            console.log(barcode + 'rejected');
            ToastAndroid.show(barcode + ' Rejected', ToastAndroid.SHORT);
            Vibration.vibrate(100);
            RNBeep.beep();
            setDropDownValue('');
            console.log(acceptedArray);
            const newArray = acceptedArray.filter(item => item !== barcode);
            console.log(newArray);
            setAcceptedArray(newArray);
            displayDataSPScan();
          } else {
            console.log(barcode + 'failed to reject item locally');
          }
          console.log(results.rows.length);
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i));
          }
          // console.log("Data updated: \n ", JSON.stringify(temp, null, 4));
          // viewDetailsR2();
        },
      );
    });
  };

  const viewDetails2 = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where status = "accepted"',
        [],
        (tx1, results) => {
          let temp = [];
          console.log(results.rows.length);
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i));
            console.log('barcode ' + results.rows.item(i).awbNo);
          }
          // ToastAndroid.show('Sync Successful',ToastAndroid.SHORT);
          console.log(
            'Data from Local Database : \n ',
            JSON.stringify(temp, null, 4),
          );
        },
      );
    });
  };
  const viewDetailsR2 = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where status = "rejected"',
        [],
        (tx1, results) => {
          let temp = [];
          console.log(results.rows.length);
          // setnewRejected(results.rows.length);
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i));
            console.log('barcode ' + results.rows.item(i).awbNo);
          }
          // ToastAndroid.show('Sync Successful',ToastAndroid.SHORT);
          console.log(
            'Data from Local Database : \n ',
            JSON.stringify(temp, null, 4),
          );
        },
      );
    });
  };
  const partialClose = () => {
    setDropDownValue11('');
  };

  const getCategories = data => {
    db.transaction(txn => {
      txn.executeSql(
        'SELECT * FROM SellerMainScreenDetails WHERE status IS NULL AND shipmentAction="Seller Pickup" AND  consignorCode=? AND (awbNo=? OR clientRefId=? OR clientShipmentReferenceNumber = ?) ',
        [route.params.consignorCode, data, data, data],
        (sqlTxn, res) => {
          // console.log('categories retrieved successfully', res.rows.length);
          console.log('ok1111', data);
          console.log(data, data, data);
          setLen(res.rows.length);
          setBarcode(data);
          if (!res.rows.length) {
            // alert('You are scanning wrong product, Please check.');
            console.log(data);
            console.log('ok2222', data);

            // barcodeCheck11();
            db.transaction(tx => {
              console.log('ok3333', data);

              tx.executeSql(
                'Select * FROM SellerMainScreenDetails WHERE status IS NOT NULL And shipmentAction="Seller Pickup" And consignorCode=? AND (awbNo=? OR clientRefId=? OR clientShipmentReferenceNumber=?)',
                [route.params.consignorCode, data, data, data],
                (tx1, results) => {
                  console.log('Results121', results.rows.length);
                  console.log('ok4444', data);

                  console.log(data);
                  if (results.rows.length === 0) {
                    ToastAndroid.show(
                      'Scanning wrong product',
                      ToastAndroid.SHORT,
                    );
                  } else {
                    ToastAndroid.show(
                      data + ' already scanned',
                      ToastAndroid.SHORT,
                    );
                  }
                },
              );
            });
          }
        },
        error => {
          console.log('error on getting categories ' + error.message);
        },
      );
    });
  };

  const updateCategories = data => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE SellerMainScreenDetails set status=? where clientShipmentReferenceNumber=?',
        ['accepted', data],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
        },
      );
    });
  };

  const updateCategories1 = data => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE categories set ScanStatus=?, UploadStatus=? where clientShipmentReferenceNumber=?',
        [1, 1, data],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
        },
      );
    });
  };
  const onSuccess = e => {
    console.log(e.data, 'barcode');
    setBarcode(e.data);
    getCategories(e.data);
  };
  const onSuccess11 = e => {
    Vibration.vibrate(100);
    RNBeep.beep();
    console.log(e.data, 'sealID');
    // getCategories(e.data);
    setBagSeal(e.data);
  };

  useEffect(() => {
    if (len) {
      // ContinueHandle();
      Vibration.vibrate(100);
      RNBeep.beep();
      ToastAndroid.show(barcode + ' Accepted', ToastAndroid.SHORT);
      updateDetails2();
      displayDataSPScan();

      setLen(false);
      // updateCategories(barcode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [len]);

  const displaydata = async () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM ShipmentRejectReasons',
        [],
        (tx1, results) => {
          let temp = [];
          // console.log(results.rows.length);
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i));
          }
          // ToastAndroid.show('Sync Successful3', ToastAndroid.SHORT);
          setRejectedData(temp);

          // console.log('Data from Local Database reject reasons: \n ', JSON.stringify(temp, null, 4),);
          // console.log('Table3 DB OK:', temp.length);
        },
      );
    });
  };
  const navigation = useNavigation();
  const [count, setcount] = useState(0);

  useEffect(() => {
    displaydata();
  }, []);

  function handleButtonPress(item) {
    setDropDownValue(item);
  }

  return (
    <NativeBaseProvider>
      <Modal
        w="100%"
        isOpen={showModal11}
        onClose={() => setShowModal11(false)}>
        <Modal.Content w="100%" bg={'#eee'}>
          <Modal.CloseButton />
          <Modal.Body w="100%">
            <Modal.Header>Enter the OTP</Modal.Header>
            <OTPTextInput
              ref={e => (otpInput = e)}
              inputCount={6}
              handleTextChange={e => setInputOtp(e)}
            />
            <Box flexDir="row" justifyContent="space-between" mt={3}>
              <Button w="40%" bg="gray.500" onPress={() => sendSmsOtp()}>
                Resend
              </Button>
              <Button w="40%" bg="#004aad" onPress={() => validateOTP()}>
                Submit
              </Button>
            </Box>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      <Modal
        isOpen={modalVisible11}
        onClose={() => {
          setModalVisible11(false);
          setDropDownValue11('');
        }}
        size="lg">
        <Modal.Content maxWidth="350">
          <Modal.CloseButton />
          <Modal.Header>Partial Close Reason</Modal.Header>
          <Modal.Body>
            {PartialCloseData &&
              PartialCloseData.map((d, index) =>
                newaccepted === 0 && d.reasonName === 'Partial Dispatch' ? (
                  <Button
                    h="12"
                    paddingBottom={5}
                    key={d.reasonID}
                    flex="1"
                    mt={2}
                    marginBottom={1.4}
                    marginTop={1.4}
                    style={{
                      backgroundColor:
                        d.reasonID === DropDownValue11 ? '#6666FF' : '#C8C8C8',
                      opacity: 0.4,
                    }}
                    title={d.reasonName}>
                    {' '}
                    <Text
                      style={{
                        color:
                          d.reasonID === DropDownValue11 ? 'white' : 'black',
                        alignContent: 'center',
                        paddingTop: -5,
                      }}>
                      {' '}
                      {d.reasonName}{' '}
                    </Text>
                  </Button>
                ) : (
                  <Button
                    h="12"
                    paddingBottom={5}
                    key={d.reasonID}
                    flex="1"
                    mt={2}
                    marginBottom={1.4}
                    marginTop={1.4}
                    style={{
                      backgroundColor:
                        d.reasonID === DropDownValue11 ? '#6666FF' : '#C8C8C8',
                    }}
                    title={d.reasonName}
                    onPress={() => handleButtonPress11(d.reasonID)}>
                    {' '}
                    <Text
                      style={{
                        color:
                          d.reasonID === DropDownValue11 ? 'white' : 'black',
                        alignContent: 'center',
                        paddingTop: -5,
                      }}>
                      {' '}
                      {d.reasonName}{' '}
                    </Text>
                  </Button>
                ),
              )}

            <Button
              flex="1"
              mt={2}
              bg="#004aad"
              marginBottom={1.5}
              marginTop={1.5}
              onPress={() => {
                partialClose();
                setModalVisible11(false);
                console.log(latitude, longitude);
                navigation.navigate('POD', {
                  Forward: route.params.Forward,
                  accepted: newaccepted,
                  rejected: newrejected,
                  notPicked: newNotPicked,
                  phone: route.params.phone,
                  userId: route.params.userId,
                  consignorCode: route.params.consignorCode,
                  DropDownValue: DropDownValue11,
                  contactPersonName: route.params.contactPersonName,
                  runsheetno: route.params.PRSNumber,
                  latitude: latitude,
                  longitude: longitude,
                });
              }}>
              Submit
            </Button>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      <View style={{backgroundColor: 'white', flex: 1, paddingTop: 30}}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Center>
            <Input
              mx="3"
              mt={4}
              placeholder="Receiver Name"
              w="90%"
              bg="gray.200"
              size="lg"
              value={name}
              onChangeText={e => setName(e)}
            />
            <Input
              mx="3"
              my={4}
              placeholder="Mobile Number"
              w="90%"
              bg="gray.200"
              size="lg"
              value={mobileNumber}
              onChangeText={e => setMobileNumber(e)}
            />
            <Button
              w="90%"
              size="lg"
              style={{backgroundColor: '#004aad', color: '#fff'}}
              title="Submit"
              onPress={() => sendSmsOtp()}>
              Submit
            </Button>
            <Button
              w="90%"
              mt={2}
              size="lg"
              style={{backgroundColor: '#004aad', color: '#fff'}}
              title="Submit"
              onPress={() => setModalVisible11(true)}>
              Partial Close
            </Button>
          </Center>
          <Center>
            <Image
              style={{width: 150, height: 150}}
              source={require('../../assets/image.png')}
              alt={'Logo Image'}
            />
          </Center>
        </ScrollView>
      </View>
      <Modal
        isOpen={showCloseBagModal11}
        onClose={() => {
          setShowCloseBagModal11(false);
          reloadScanner();
          setScanned(true);
        }}
        size="lg">
        <Modal.Content maxWidth="350">
          <Modal.CloseButton />
          <Modal.Header>Close Bag</Modal.Header>
          <Modal.Body>
            {showCloseBagModal11 && (
              <QRCodeScanner
                onRead={onSuccess11}
                reactivate={true}
                reactivateTimeout={2000}
                flashMode={RNCamera.Constants.FlashMode.off}
                ref={node => {
                  this.scanner = node;
                }}
                containerStyle={{height: 116, marginBottom: '55%'}}
                cameraStyle={{
                  height: 90,
                  marginTop: 95,
                  marginBottom: '15%',
                  width: 289,
                  alignSelf: 'center',
                  justifyContent: 'center',
                }}
              />
            )}
            {'\n'}
            <Input
              placeholder="Enter Bag Seal"
              size="md"
              value={bagSeal}
              onChangeText={text => setBagSeal(text)}
              style={{
                width: 290,
                backgroundColor: 'white',
              }}
            />
            <Button
              flex="1"
              mt={2}
              bg="#004aad"
              onPress={() => {
                CloseBagEndScan();
                setShowCloseBagModal11(false);
              }}>
              Submit
            </Button>
          </Modal.Body>
        </Modal.Content>
      </Modal>

      <Modal
        isOpen={showCloseBagModal}
        onClose={() => {
          setShowCloseBagModal(false);
          setShowQRCodeModal(true);
          reloadScanner();
        }}
        size="lg">
        <Modal.Content maxWidth="350">
          <Modal.CloseButton />
          <Modal.Header>Close Bag</Modal.Header>
          <Modal.Body>
            <QRCodeScanner
              onRead={onSuccess11}
              reactivate={true}
              reactivateTimeout={2000}
              flashMode={RNCamera.Constants.FlashMode.off}
              containerStyle={{height: 116, marginBottom: '55%'}}
              cameraStyle={{
                height: 90,
                marginTop: 95,
                marginBottom: '15%',
                width: 289,
                alignSelf: 'center',
                justifyContent: 'center',
              }}
            />
            {'\n'}
            <Input
              placeholder="Enter Bag Seal"
              size="md"
              value={bagSeal}
              onChangeText={text => setBagSeal(text)}
              style={{
                width: 290,
                backgroundColor: 'white',
              }}
            />
            <Button
              flex="1"
              mt={2}
              bg="#004aad"
              onPress={() => {
                CloseBag(), setShowCloseBagModal(false);
              }}>
              Submit
            </Button>
          </Modal.Body>
        </Modal.Content>
      </Modal>

      <Modal
        isOpen={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setDropDownValue('');
        }}
        size="lg">
        <Modal.Content maxWidth="350">
          <Modal.CloseButton />
          <Modal.Header>Reject Reason</Modal.Header>
          <Modal.Body>
            {rejectedData.map(d => (
              <Button
                key={d.shipmentExceptionReasonID}
                flex="1"
                mt={2}
                marginBottom={1.5}
                marginTop={1.5}
                title={d.shipmentExceptionReasonName}
                style={{
                  backgroundColor:
                    d.shipmentExceptionReasonID === DropDownValue
                      ? '#6666FF'
                      : '#C8C8C8',
                }}
                onPress={() => handleButtonPress(d.shipmentExceptionReasonID)}>
                <Text
                  style={{
                    color:
                      DropDownValue == d.shipmentExceptionReasonID
                        ? 'white'
                        : 'black',
                  }}>
                  {d.shipmentExceptionReasonName}
                </Text>
              </Button>
            ))}
            <Button
              flex="1"
              mt={2}
              bg="#004aad"
              marginBottom={1.5}
              marginTop={1.5}
              onPress={() => {
                rejectDetails2();
                setModalVisible(false);
              }}>
              Submit
            </Button>
          </Modal.Body>
        </Modal.Content>
      </Modal>

      <ScrollView
        style={{paddingTop: 20, paddingBottom: 50}}
        showsVerticalScrollIndicator={false}>
        {!showCloseBagModal && scanned && (
          <QRCodeScanner
            onRead={onSuccess}
            reactivate={true}
            reactivateTimeout={3000}
            ref={scannerRef}
            flashMode={RNCamera.Constants.FlashMode.off}
            containerStyle={{
              width: '100%',
              alignSelf: 'center',
              backgroundColor: 'white',
            }}
            cameraStyle={{width: '90%', alignSelf: 'center'}}
            topContent={
              <View>
                <Text>Scan your Shipments </Text>
              </View>
            }
          />
        )}
        <View>
          <Center></Center>
        </View>
        <View>
          <View style={{backgroundColor: 'white'}}>
            <View style={{alignItems: 'center', marginTop: 15}}>
              <View
                style={{
                  backgroundColor: 'lightgray',
                  padding: 10,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: '90%',
                  borderRadius: 5,
                  flex: 1,
                }}>
                <Text style={{fontSize: 18, fontWeight: '500'}}>
                  shipment ID:{' '}
                </Text>
                <Text style={{fontSize: 18, fontWeight: '500'}}>{barcode}</Text>
                {/* <View style={{ flex: 1,
                alignItems: 'center',
                justifyContent: 'center',}}>
                <TextInput
                style={styles.textInput}
                placeholder="Enter shipment ID"
                value={barcode}
                onChangeText={(text) => setBarcode(text)}
                />
              <View style={styles.infoContainer}>
            <View style={styles.info}>
            <Text style={styles.label}>shipment ID: </Text>
            <Text style={styles.value}>{barcode}</Text>
        </View> */}
                {/* </View> */}
              </View>
              <Button
                title="Reject Shipment"
                onPress={() => setModalVisible(true)}
                w="90%"
                size="lg"
                bg="#004aad"
                mb={4}
                mt={4}>
                Reject Shipment
              </Button>
              <View
                style={{
                  width: '90%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  borderWidth: 1,
                  borderBottomWidth: 0,
                  borderColor: 'lightgray',
                  borderTopLeftRadius: 5,
                  borderTopRightRadius: 5,
                  padding: 10,
                }}>
                <Text style={{fontSize: 18, fontWeight: '500'}}>Expected</Text>
                <Text style={{fontSize: 18, fontWeight: '500'}}>
                  {route.params.Forward}
                </Text>
              </View>
              <View
                style={{
                  width: '90%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  borderWidth: 1,
                  borderBottomWidth: 0,
                  borderColor: 'lightgray',
                  padding: 10,
                }}>
                <Text style={{fontSize: 18, fontWeight: '500'}}>Accepted</Text>
                <Text style={{fontSize: 18, fontWeight: '500'}}>
                  {newaccepted}
                </Text>
              </View>
              <View
                style={{
                  width: '90%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  borderWidth: 1,
                  borderBottomWidth: 0,
                  borderColor: 'lightgray',
                  padding: 10,
                }}>
                <Text style={{fontSize: 18, fontWeight: '500'}}>Rejected</Text>
                <Text style={{fontSize: 18, fontWeight: '500'}}>
                  {newrejected}
                </Text>
              </View>
              <View
                style={{
                  width: '90%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  borderWidth: 1,
                  borderColor: 'lightgray',
                  borderBottomLeftRadius: 5,
                  borderBottomRightRadius: 5,
                  padding: 10,
                }}>
                <Text style={{fontSize: 18, fontWeight: '500'}}>
                  Not Picked
                </Text>
                <Text style={{fontSize: 18, fontWeight: '500'}}>
                  {newNotPicked}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              width: '90%',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignSelf: 'center',
              marginTop: 10,
            }}>
            <Button
              onPress={() => {
                if (newaccepted === 0) {
                  partialClose112();
                } else {
                  if (acceptedArray.length !== 0) {
                    setShowCloseBagModal11(true);
                  } else {
                    partialClose112();
                  }
                }
              }}
              w="48%"
              size="lg"
              bg="#004aad">
              End Scan
            </Button>

            <Button
              w="48%"
              size="lg"
              bg={buttonColor}
              onPress={() => {
                if (acceptedArray.length === 0) {
                  ToastAndroid.show('Bag is Empty', ToastAndroid.SHORT);
                } else {
                  setShowCloseBagModal(true);
                }
              }}>
              Close bag
            </Button>
          </View>
          <Center>
            <Image
              style={{
                width: 150,
                height: 100,
              }}
              source={require('../../assets/image.png')}
              alt={'Logo Image'}
            />
          </Center>
        </View>
      </ScrollView>
    </NativeBaseProvider>
  );
};

export default ShipmentBarcode;

export const styles = StyleSheet.create({
  textInput: {
    height: 40,
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  infoContainer: {
    marginTop: 10,
    width: '90%',
  },
  info: {
    backgroundColor: 'lightgray',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 5,
  },
  label: {
    fontSize: 18,
    fontWeight: '500',
  },
  value: {
    fontSize: 18,
    fontWeight: '500',
  },
  normal: {
    fontFamily: 'open sans',
    fontWeight: 'normal',
    fontSize: 20,
    color: '#eee',
    marginTop: 27,
    paddingTop: 15,
    marginLeft: 10,
    marginRight: 10,
    paddingBottom: 15,
    backgroundColor: '#eee',
    width: 'auto',
    borderRadius: 0,
  },
  container: {
    flexDirection: 'row',
  },
  text: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  main1: {
    backgroundColor: '#004aad',
    fontFamily: 'open sans',
    fontWeight: 'normal',
    fontSize: 20,
    marginTop: 27,
    paddingTop: 15,
    marginLeft: 10,
    marginRight: 10,
    paddingBottom: 15,
    width: 'auto',
    borderRadius: 20,
  },
  textbox1: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    width: 'auto',
    flexDirection: 'column',
    textAlign: 'center',
  },

  textbtn: {
    alignSelf: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  btn: {
    fontFamily: 'open sans',
    fontSize: 15,
    lineHeight: 10,
    marginTop: 80,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#004aad',
    width: 100,
    borderRadius: 10,
    paddingLeft: 0,
    marginLeft: 60,
  },
  bt3: {
    fontFamily: 'open sans',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    lineHeight: 10,
    marginTop: 10,
    backgroundColor: '#004aad',
    width: 'auto',
    borderRadius: 10,
    paddingLeft: 0,
    marginLeft: 10,
    marginRight: 15,
    // width:'95%',
    // marginTop:60,
  },
  picker: {
    color: 'white',
  },
  pickerItem: {
    fontSize: 20,
    height: 50,
    color: '#ffffff',
    backgroundColor: '#2196f3',
    textAlign: 'center',
    margin: 10,
    borderRadius: 10,
  },
  modalContent: {
    flex: 0.57,
    justifyContent: 'center',
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    marginLeft: 28,
    marginTop: 175,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 100,
    margin: 5.5,
    color: 'rgba(0,0,0,1)',
    alignContent: 'center',
  },

  containerText: {
    paddingLeft: 30,
    color: '#000',
    fontSize: 15,
  },
  otp: {
    backgroundColor: '#004aad',
    color: '#000',
    marginTop: 5,
    borderRadius: 10,
  },
});
