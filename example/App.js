/* @flow */

import React, { Component } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
// eslint-disable-next-line import/no-unresolved
import SocketMobile, { STATUS_WAITING } from 'react-native-socket-mobile';

const bundleId = 'ADD_YOUR_BUNDLE_ID';
const appKey = 'ADD_YOUR_APP_KEY';
const developerId = 'ADD_YOUR_DEVELOPER_ID';

type Props = {};

type State = {
  isBusy: boolean,
  lastScan: string,
  status: string,
};

export default class App extends Component<Props, State> {
  state = {
    isBusy: false,
    lastScan: '--',
    status: 'disconnected',
  };

  componentDidMount() {
    this.initStatus();
  }

  componentWillUnmount() {
    SocketMobile.clearAllListeners();
  }

  initStatus = async () => {
    const status = await SocketMobile.updateStatusFromDevices();
    if (status !== STATUS_WAITING) {
      this.setState({ status: 'connected ' });
      this.setListeners();
    }
  };

  startListening = async () => {
    this.setListeners();

    this.setState({ isBusy: true });
    await SocketMobile.start({
      bundleId,
      developerId,
      appKey,
    });
    this.setState({ isBusy: false });
  };

  stopListening = async () => {
    this.setState({ isBusy: true });

    await SocketMobile.stop();
    SocketMobile.clearAllListeners();

    this.setState({ isBusy: false, lastScan: '--' });
  };

  setListeners = () => {
    SocketMobile.setDeviceStatusListener(status => {
      if (status === 'connected') {
        this.setState({ status: 'connected' });
      } else {
        this.setState({ status: 'disconnected' });
      }
    });
    SocketMobile.setDataListener(({ data }) => {
      this.setState({ lastScan: data });
    });
  };

  checkStatus = async () => {
    const status = await SocketMobile.updateStatusFromDevices();
    Alert.alert('Status', status);
  };

  render() {
    return (
      <View style={styles.container}>
        <Button
          disabled={this.state.isBusy}
          title={
            this.state.isBusy
              ? 'Busy...'
              : this.state.status === 'disconnected' ? 'Start' : 'Stop'
          }
          onPress={() => {
            if (this.state.status === 'disconnected') {
              this.startListening();
            } else {
              this.stopListening();
            }
          }}
        />
        <Button title="Check status" onPress={this.checkStatus} />
        <Text style={styles.info}>{`Status: ${this.state.status
          .charAt(0)
          .toUpperCase() + this.state.status.slice(1)}`}</Text>
        <Text style={styles.info}>{`Code: ${this.state.lastScan}`}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  info: {
    fontSize: 16,
    marginTop: 16,
  },
});
