import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";

interface AccordionListProps {
  options: string[];
  onSelect?: (item: string) => void;
  selectedItem?: string | null;
  containerStyle?: ViewStyle;
  buttonStyle?: ViewStyle;
  buttonTextStyle?: TextStyle;
  listStyle?: ViewStyle;
  listItemStyle?: ViewStyle;
  listItemTextStyle?: TextStyle;
  selectedItemStyle?: ViewStyle;
  selectedItemTextStyle?: TextStyle;
  buttonTitle?: string;
}

const AccordionList: React.FC<AccordionListProps> = ({
  options,
  onSelect,
  selectedItem = null,
  containerStyle,
  buttonStyle,
  buttonTextStyle,
  listStyle,
  listItemStyle,
  listItemTextStyle,
  selectedItemStyle,
  selectedItemTextStyle,
  buttonTitle,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const handleSelect = (item: string) => {
    onSelect && onSelect(item);
    setIsOpen(false);
  };

  return (
    <View style={containerStyle}>
      <Pressable style={buttonStyle} onPress={toggleOpen}>
        <Text style={buttonTextStyle}>
          {selectedItem || buttonTitle} {isOpen ? "▲" : "▼"}
        </Text>
      </Pressable>

      {isOpen && (
        <FlatList
          data={options}
          keyExtractor={(item) => item}
          style={listStyle}
          renderItem={({ item }) => (
            <Pressable
              style={[
                listItemStyle,
                item === selectedItem ? selectedItemStyle : null,
              ]}
              onPress={() => handleSelect(item)}
            >
              <Text
                style={[
                  listItemTextStyle,
                  item === selectedItem ? selectedItemTextStyle : null,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
};

export default AccordionList;
