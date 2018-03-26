/* @flow */

import React, { Component } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
// eslint-disable-next-line import/no-unresolved
import SocketMobile from 'react-native-socket-mobile';

import { bundleId, appKey, developerId } from './secrets';

type Props = {};

type State = {
  isBusy: boolean,
  started: boolean,
  lastScan: string,
};

export default class App extends Component<Props, State> {
  state = {
    isBusy: false,
    started: false,
    lastScan: '--',
  };

  startListening = async () => {
    SocketMobile.setDeviceStatusListener(status => {
      if (status === 'connected') {
        SocketMobile.setDataListener(({ data }) => {
          this.setState({ lastScan: data });
        });
      }
    });
    this.setState({ isBusy: true });
    await SocketMobile.start({
      bundleId,
      developerId,
      appKey,
    });
    this.setState({ isBusy: false, started: true });
  };

  stopListening = async () => {
    this.setState({ isBusy: true });
    await SocketMobile.stop();
    this.setState({ isBusy: false, started: false, lastScan: '' });
  };

  render() {
    return (
      <View style={styles.container}>
        <Button
          disabled={this.state.isBusy}
          title={!this.state.started ? 'Start' : 'Stop'}
          onPress={() => {
            if (!this.state.started) {
              this.startListening();
            } else {
              this.stopListening();
            }
          }}
        />
        <Button
          title="Check status"
          onPress={() => SocketMobile.updateStatusFromDevices()}
        />
        <Text style={styles.data}>{this.state.lastScan}</Text>
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
  data: {
    fontSize: 20,
    marginTop: 16,
  },
});
