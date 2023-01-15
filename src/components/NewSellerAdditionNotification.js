import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {NativeBaseProvider, Box, Center, VStack, Button, Icon, Input, Heading, Alert, Text, Modal, ScrollView, AspectRatio, Stack, HStack, Divider, Fab } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image, StyleSheet, View } from 'react-native';
import { convertAbsoluteToRem } from 'native-base/lib/typescript/theme/tools';


export default function NewSellerAdditionNotification() {

  const [vehicle, setVehicle] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState(0);
  const [data, setData] = useState([]);
  const [printData, setPrintData] = useState();
  const [loginClicked, setLoginClicked] = useState(false);
  const navigation = useNavigation();
  const [userId, setUserId] = useState('');
  const getData = async () => {
    try {
        const value = await AsyncStorage.getItem('@storage_Key');
        if (value !== null) {
            const data = JSON.parse(value);
            setUserId(data.userId);
            // console.log(data.userId);
        } else {
            setUserId(' ');
        }
    } catch (e) {
        console.log(e);
    }
};
console.log(userId)
useEffect(() => {
    getData();
}, []);
const DisplayData= () => {
   fetch(`https://bked.logistiex.com/SellerMainScreen/getadditionalwork/${userId}`)
  .then(res => {
    if(!res.ok) throw Error(res.statusText);
    return res.json();
  })
  .then(data => {
    setData(data)
  })
  .catch(error => {
    console.error('Error Msg:', error)
  })
};
useEffect(() => {
    DisplayData();
}, []);
// console.log('Data:',data);
  return (
    <NativeBaseProvider>
      <ScrollView>
      <Box flex={1} bg="coolGray.100" p={4}>
            {(data) &&
                data.map(d=>{
                    console.log(d.consignorName);
                return(
                <Box width='100%' marginBottom='5'  alignItems="center">
                    <Box width='100%' rounded="lg" overflow="hidden" borderColor="coolGray.100" borderWidth="1" _dark={{
                        borderColor: "coolGray.600",
                        backgroundColor: "white"
                    }} _web={{
                        shadow: 2,
                        borderWidth: 0
                    }} _light={{
                        backgroundColor: "white"
                    }}>
                    <Stack p="4" space={3}>
                        <HStack alignItems="center" space={4} justifyContent="space-between">
                            <HStack alignItems="center">
                                <Text color="black" _dark={{
                                    color: "gray.400"
                                    }} fontWeight="400">
                                    {d.consignorName}   {d.consignorCode}
                                </Text>
                            </HStack>
                            <HStack alignItems="center">
                                <Text color="black" _dark={{
                                    color: "gray.400"
                                    }} fontWeight="400">
                                    {d.ForwardPickups}/{d.ReverseDeliveries}
                                </Text>
                            </HStack>
                        </HStack>
                        <Divider my="1" _light={{
                            bg: "muted.200"
                            }} _dark={{
                            bg: "muted.50"
                        }} />
                    <Stack space={2}>
                    <Text fontSize="sm" _light={{
                        color: "black"
                        }} _dark={{
                        color: "black"
                        }} fontWeight="500" ml="-0.5" mt="-1">
                        Address of seller {"\n"}
                        {d.consignorAddress1} {d.consignorAddress2}{"\n"}
                        {d.consignorCity} - {d.consignorPincode}

                    </Text>
                    </Stack>
                <Divider my="1" _light={{
                    bg: "muted.200"
                    }} _dark={{
                    bg: "muted.50"
                }} />
                <HStack alignItems="center" space={4} justifyContent="space-between">
                    <HStack alignItems="center">
                    <Button style={{backgroundColor:'#FF2E2E'}} _dark={{
                            color: "red.200"
                            }} fontWeight="400">
                            Reject
                        </Button>
                    </HStack>
                    <HStack alignItems="center">
                        <Button style={{backgroundColor:'#004aad'}} _dark={{
                            color: "blue.200"
                            }} fontWeight="400">
                            Accept
                        </Button>
                    </HStack>
                </HStack>
            </Stack>
            </Box>
        </Box>
       )
        })
}
        <Center>
          <Image style={{ width: 150, height: 100 }} source={require('../assets/image.png')} alt={"Logo Image"} />
        </Center>
      </Box>
      </ScrollView>
      
        
            
    </NativeBaseProvider>
  );
}
