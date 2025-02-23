import { StyleSheet, Text, View } from "react-native";
import { Redirect } from "expo-router";
export default function Page() {
  return (
    <View style={styles.container}>
      {/* <View style={styles.main}>
        <Text style={styles.title}>Hello World</Text>
        <Text style={styles.subtitle}>This is the first page of your app.</Text>
      </View> */}
      <Redirect href={"/(tabs)/portfolio"} ></Redirect>
      {/* If i had put  "/(tabs)/" for the href value and i had an index file inside the tabs folder it would redirect to that index file*/}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 960,
    marginHorizontal: "auto",
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 36,
    color: "#38434D",
  },
});
