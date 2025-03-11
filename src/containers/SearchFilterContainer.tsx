import React from "react";
import { View, StyleSheet } from "react-native";
import SearchBar from "../components/SearchBar2";
import FilterButton from "../components/FilterButton";

const SearchFilterContainer = () => {
  return (
    <View style={styles.container}>
      <View style={styles.searchBarWrapper}>
        <SearchBar />
        <View style={styles.filterButtonContainer}>
          <FilterButton onPress={() => console.log("Filter clicked")} />
        </View>      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    /*
    paddingHorizontal: 16,
    marginTop: 10,
    */
    width: 358,
    height: 54,
    position: 'absolute',
    top: 120,
    left: 20,
  },
  searchBarWrapper: {
    /*
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 30,  // Pour le design en demi-cercle
    borderWidth: 1,
    borderColor: "#EAEAEA",
    paddingHorizontal: 10,
    height: 50,
    */
//    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: "100%",
    width: "100%",
  },
  filterButtonContainer: {
    position: "absolute",
    right: 7,
    top: 7, // (54 - 40) / 2 = 7, pour centrer verticalement
  }
});


export default SearchFilterContainer;
