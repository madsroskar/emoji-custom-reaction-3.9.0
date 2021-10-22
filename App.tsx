import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  LogBox,
  Platform,
  SafeAreaView,
  useColorScheme,
  View,
} from "react-native";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  RouteProp,
} from "@react-navigation/native";
import {
  createStackNavigator,
  StackNavigationProp,
  useHeaderHeight,
} from "@react-navigation/stack";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Svg, Text as SvgText } from 'react-native-svg';
import { ChannelSort, Channel as ChannelType, StreamChat } from "stream-chat";
import {
  Channel,
  ChannelList,
  Chat,
  MessageInput,
  MessageList,
  OverlayProvider,
  Streami18n,
  Thread,
  ThreadContextValue,
  useAttachmentPickerContext,
  useOverlayContext,
} from "stream-chat-react-native";

import { useStreamChatTheme } from "./useStreamChatTheme";

LogBox.ignoreAllLogs(true);

type LocalAttachmentType = Record<string, unknown>;
type LocalChannelType = Record<string, unknown>;
type LocalCommandType = string;
type LocalEventType = Record<string, unknown>;
type LocalMessageType = Record<string, unknown>;
type LocalResponseType = Record<string, unknown>;
type LocalUserType = Record<string, unknown>;

const chatClient = StreamChat.getInstance<
  LocalAttachmentType,
  LocalChannelType,
  LocalCommandType,
  LocalEventType,
  LocalMessageType,
  LocalResponseType,
  LocalUserType
>("API_TOKEN");
const userToken =
  "USER_TOKEN";
const user = {
  id: "ron",
};

const filters = {
  example: "example-apps",
  members: { $in: ["ron"] },
  type: "messaging",
};
const sort: ChannelSort<LocalChannelType> = { last_message_at: -1 };
const options = {
  presence: true,
  state: true,
  watch: true,
};

// Choosing some emoji to use as reactions
const reactionEmojis = {
  thumbsUp: '👍🏽',
  duck: '🦆',
  personBiking: '🚴🏾',
  snowboarder: '🏂',
}

type ReactionEmoji = keyof typeof reactionEmojis;

type ReactionProps = {
  emoji: ReactionEmoji,
}

// Component to make an SVG containing an emoji as text
const Reaction = (props: ReactionProps) => {
  const {emoji} = props;

  const [height, width] = [24, 24];

  return (
    <Svg height={height} width={width} viewBox={`0 0 ${width} ${height}`}>
      <SvgText rotate="0" textAnchor="middle" x="12" y="16" fill="white" fontSize="12">{reactionEmojis[emoji]}</SvgText>
    </Svg>
  );
}

/**
 * Start playing with streami18n instance here:
 * Please refer to description of this PR for details: https://github.com/GetStream/stream-chat-react-native/pull/150
 */
const streami18n = new Streami18n({
  language: "en",
});

type ChannelListScreenProps = {
  navigation: StackNavigationProp<NavigationParamsList, "ChannelList">;
};

const ChannelListScreen: React.FC<ChannelListScreenProps> = ({
  navigation,
}) => {
  const { setChannel } = useContext(AppContext);

  const memoizedFilters = useMemo(() => filters, []);

  return (
    <Chat client={chatClient} i18nInstance={streami18n}>
      <View style={{ height: "100%" }}>
        <ChannelList<
          LocalAttachmentType,
          LocalChannelType,
          LocalCommandType,
          LocalEventType,
          LocalMessageType,
          LocalResponseType,
          LocalUserType
        >
          filters={memoizedFilters}
          onSelect={(channel) => {
            setChannel(channel);
            navigation.navigate("Channel");
          }}
          options={options}
          sort={sort}
        />
      </View>
    </Chat>
  );
};

type ChannelScreenProps = {
  navigation: StackNavigationProp<NavigationParamsList, "Channel">;
};

const ChannelScreen: React.FC<ChannelScreenProps> = ({ navigation }) => {
  const { channel, setThread, thread } = useContext(AppContext);
  const headerHeight = useHeaderHeight();
  const { setTopInset } = useAttachmentPickerContext();
  const { overlay } = useOverlayContext();

  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: Platform.OS === "ios" && overlay === "none",
    });
  }, [overlay]);

  useEffect(() => {
    setTopInset(headerHeight);
  }, [headerHeight]);

  return (
    <SafeAreaView>
      <Chat client={chatClient} i18nInstance={streami18n}>
        <Channel
          channel={channel}
          keyboardVerticalOffset={headerHeight}
          supportedReactions={[
            {
              Icon: () => <Reaction emoji="thumbsUp" />,
              type: 'like'
            },
            {
              Icon: () => <Reaction emoji="duck" />,
              type: 'duck'
            },
            {
              Icon: () => <Reaction emoji="snowboarder" />,
              type: 'snowboarder'
            },
            {
              Icon: () => <Reaction emoji="personBiking" />,
              type: 'personBiking'
            },
          ]}
          thread={thread}
        >
          <View style={{ flex: 1 }}>
            <MessageList<
              LocalAttachmentType,
              LocalChannelType,
              LocalCommandType,
              LocalEventType,
              LocalMessageType,
              LocalResponseType,
              LocalUserType
            >
              onThreadSelect={(selectedThread) => {
                setThread(selectedThread);
                if (channel?.id) {
                  navigation.navigate("Thread");
                }
              }}
            />
            <MessageInput />
          </View>
        </Channel>
      </Chat>
    </SafeAreaView>
  );
};

type ThreadScreenProps = {
  navigation: StackNavigationProp<ThreadRoute, "Thread">;
  route: RouteProp<ThreadRoute, "Thread">;
};

const ThreadScreen: React.FC<ThreadScreenProps> = ({ navigation }) => {
  const { channel, setThread, thread } = useContext(AppContext);
  const headerHeight = useHeaderHeight();
  const { overlay } = useOverlayContext();

  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: Platform.OS === "ios" && overlay === "none",
    });
  }, [overlay]);

  return (
    <SafeAreaView>
      <Chat client={chatClient} i18nInstance={streami18n}>
        <Channel
          channel={channel}
          keyboardVerticalOffset={headerHeight}
          thread={thread}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "flex-start",
            }}
          >
            <Thread<
              LocalAttachmentType,
              LocalChannelType,
              LocalCommandType,
              LocalEventType,
              LocalMessageType,
              LocalResponseType,
              LocalUserType
            >
              onThreadDismount={() => setThread(null)}
            />
          </View>
        </Channel>
      </Chat>
    </SafeAreaView>
  );
};

type ChannelRoute = { Channel: undefined };
type ChannelListRoute = { ChannelList: undefined };
type ThreadRoute = { Thread: undefined };
type NavigationParamsList = ChannelRoute & ChannelListRoute & ThreadRoute;

const Stack = createStackNavigator<NavigationParamsList>();

type AppContextType = {
  channel:
    | ChannelType<
        LocalAttachmentType,
        LocalChannelType,
        LocalCommandType,
        LocalEventType,
        LocalMessageType,
        LocalResponseType,
        LocalUserType
      >
    | undefined;
  setChannel: React.Dispatch<
    React.SetStateAction<
      | ChannelType<
          LocalAttachmentType,
          LocalChannelType,
          LocalCommandType,
          LocalEventType,
          LocalMessageType,
          LocalResponseType,
          LocalUserType
        >
      | undefined
    >
  >;
  setThread: React.Dispatch<
    React.SetStateAction<
      | ThreadContextValue<
          LocalAttachmentType,
          LocalChannelType,
          LocalCommandType,
          LocalEventType,
          LocalMessageType,
          LocalResponseType,
          LocalUserType
        >["thread"]
      | undefined
    >
  >;
  thread:
    | ThreadContextValue<
        LocalAttachmentType,
        LocalChannelType,
        LocalCommandType,
        LocalEventType,
        LocalMessageType,
        LocalResponseType,
        LocalUserType
      >["thread"]
    | undefined;
};

const AppContext = React.createContext({} as AppContextType);

const App = () => {
  const colorScheme = useColorScheme();
  const { bottom } = useSafeAreaInsets();
  const theme = useStreamChatTheme();

  const [channel, setChannel] =
    useState<
      ChannelType<
        LocalAttachmentType,
        LocalChannelType,
        LocalCommandType,
        LocalEventType,
        LocalMessageType,
        LocalResponseType,
        LocalUserType
      >
    >();
  const [clientReady, setClientReady] = useState(false);
  const [thread, setThread] =
    useState<
      ThreadContextValue<
        LocalAttachmentType,
        LocalChannelType,
        LocalCommandType,
        LocalEventType,
        LocalMessageType,
        LocalResponseType,
        LocalUserType
      >["thread"]
    >();

  useEffect(() => {
    const setupClient = async () => {
      await chatClient.connectUser(user, userToken);

      return setClientReady(true);
    };

    setupClient();
  }, []);

  return (
    <NavigationContainer
      theme={{
        colors: {
          ...(colorScheme === "dark" ? DarkTheme : DefaultTheme).colors,
          background: theme.colors?.white_snow || "#FCFCFC",
        },
        dark: colorScheme === "dark",
      }}
    >
      <AppContext.Provider value={{ channel, setChannel, setThread, thread }}>
        <OverlayProvider<
          LocalAttachmentType,
          LocalChannelType,
          LocalCommandType,
          LocalEventType,
          LocalMessageType,
          LocalResponseType,
          LocalUserType
        >
          bottomInset={bottom}
          i18nInstance={streami18n}
          value={{ style: theme }}
        >
          {clientReady && (
            <Stack.Navigator
              initialRouteName="ChannelList"
              screenOptions={{
                headerTitleStyle: { alignSelf: "center", fontWeight: "bold" },
              }}
            >
              <Stack.Screen
                component={ChannelScreen}
                name="Channel"
                options={() => ({
                  headerBackTitle: "Back",
                  headerRight: () => <></>,
                  headerTitle: channel?.data?.name,
                })}
              />
              <Stack.Screen
                component={ChannelListScreen}
                name="ChannelList"
                options={{ headerTitle: "Channel List" }}
              />
              <Stack.Screen
                component={ThreadScreen}
                name="Thread"
                options={() => ({ headerLeft: () => <></> })}
              />
            </Stack.Navigator>
          )}
        </OverlayProvider>
      </AppContext.Provider>
    </NavigationContainer>
  );
};

export default () => {
  const theme = useStreamChatTheme();

  return (
    <SafeAreaProvider
      style={{ backgroundColor: theme.colors?.white_snow || "#FCFCFC" }}
    >
      <App />
    </SafeAreaProvider>
  );
};
