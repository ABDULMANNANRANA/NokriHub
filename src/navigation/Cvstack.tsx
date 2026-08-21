import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyCVsScreen from '../screens/user/cv/MyCVsScreen';
import CVTemplatePickerScreen from '../screens/user/cv/CVTemplatePickerScreen';
import CVEditorScreen from '../screens/user/cv/CVEditorScreen';
import CVPreviewScreen from '../screens/user/cv/CVPreviewScreen';

const Stack = createNativeStackNavigator();

export default function CVStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MyCVsList" component={MyCVsScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="CVTemplatePicker" component={CVTemplatePickerScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CVEditor" component={CVEditorScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="CVPreview" component={CVPreviewScreen} options={{ headerShown: false }}/>
    </Stack.Navigator>
  );
}