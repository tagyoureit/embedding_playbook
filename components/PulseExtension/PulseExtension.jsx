// eslint-disable-next-line no-unused-vars
import { tab_extension } from 'libs';
import { useEffect, useState, useRef, forwardRef, useId, useContext } from 'react';
import { Button } from "components/ui/";
import { Demo } from 'components';

import { SecureDataContext } from 'components/SecureDataProvider';
import { TableauExtension } from '../TableauExtension';
import { ExpireSessionButton } from "components/ExpireSession";
import { useTableauSession } from 'hooks';

export const PulseExtension = forwardRef(function Extension(props, ref) {
  const [tableauUrl, setTableauUrl] = useState('undefined');
  const [siteName, setSiteName] = useState('undefined');
  const [userName, setUserName] = useState('undefined');
  const [caClientId, setCaClientId] = useState('undefined');
  const [caSecretId, setCaSecretId] = useState('undefined');
  const [caSecretValue, setCaSecretValue] = useState('undefined');
  // Access the context and secureData object
  const { secureData, updateSecureData } = useContext(SecureDataContext);
  const localRef = useRef(null);
  // Use the forwarded ref if provided, otherwise use the local ref
  const innerRef = ref || localRef;
  let settings;

  // Update values
  const handleUpdate = ( settings) => {
    updateSecureData({
      ...settings
    });
  }

  const configure = () => {
    // This uses the window.location.origin property to retrieve the scheme, hostname, and
    // port where the parent extension is currently running, so this string doesn't have
    // to be updated if the extension is deployed to a new location.
    const popupUrl = `${window.location.origin}/pulseExtensionDialog`;

    /**
     * This is the API call that actually displays the popup extension to the user.  The
     * popup is always a modal dialog.  The only required parameter is the URL of the popup,co
     * which must be the same domain, port, and scheme as the parent extension.
     *
     * The developer can optionally control the initial size of the extension by passing in
     * an object with height and width properties.  The developer can also pass a string as the
     * 'initial' payload to the popup extension.  This payload is made available immediately to
     * the popup extension.  In this example, the value '5' is passed, which will serve as the
     * default interval of refresh.
     */
    if (typeof settings === 'undefined' || Object.keys(settings).length === 0 || tableauUrl === 'undefined') {
      settings = {
        caClientId: '6b828aa5-dd31-4c35-9be9-fddf7e0b7933',
        caSecretId: 'd7949278-f28e-48cf-8313-765c17972961',
        caSecretValue: 'dwPRgqnLDAO4G5GOrgmnylkAK5ODXxKfS/hEhTyZtzA=',
        siteName: 'rgdemosite',
        tableauUrl: 'https://10az.online.tableau.com',
        userName: 'rgoldin@salesforce.com',
      };
    }
    tableau.extensions.ui
      .displayDialogAsync(popupUrl, JSON.stringify(settings), { height: 600, width: 500 })
      .then(async (closePayload) => {
        // The promise is resolved when the dialog has been expectedly closed, meaning that
        // the popup extension has called tableau.extensions.ui.closeDialog.
        // $('#inactive').hide();
        // $('#active').show();

        settings = { ...JSON.parse(closePayload) };
        console.log(`settings updated from closePayload: ${JSON.stringify(settings, null, 2)}`);
        // await loadPulseMetrics()
        // The close payload is returned from the popup extension via the closeDialog method.
        // $('#interval').text(closePayload);
        // setupRefreshInterval(closePayload);
      })
      .catch((error) => {
        // One expected error condition is when the popup is closed by the user (meaning the user
        // clicks the 'X' in the top right of the dialog).  This can be checked for like so:
        switch (error.errorCode) {
          case tableau.ErrorCodes.DialogClosedByUser:
            console.log('Dialog was closed by user');
            break;
          default:
            console.error(error.message);
        }
      });
  };

  useEffect(() => {
    tableau.extensions.initializeAsync({ configure }).then(async function () {
      // This event allows for the parent extension and popup extension to keep their
      // settings in sync.  This event will be triggered any time a setting is
      // changed for this extension, in the parent or popup (i.e. when settings.saveAsync is called).
      tableau.extensions.settings.addEventListener(tableau.TableauEventType.SettingsChanged, async (settingsEvent) => {
        console.log(`Settings updated`);
        settings = { ...((settingsEvent).newSettings) };
        console.log(settings);
        setTableauUrl(settings.tableauUrl);
        setSiteName(settings.siteName);
        setUserName(settings.userName);
        setCaClientId(settings.caClientId);
        setCaSecretId(settings.caSecretId);
        setCaSecretValue(settings.caSecretValue);
        handleUpdate(settings);
        // updateExtensionBasedOnSettings((settingsEvent as SettingsChangedEvent).newSettings);
        // await loadPulseMetrics();
      });
      let loadSettings = tableau.extensions.settings.getAll();
      settings = { ...loadSettings };
      setTableauUrl(settings.tableauUrl);
      setSiteName(settings.siteName);
      setUserName(settings.userName);
      setCaClientId(settings.caClientId);
      setCaSecretId(settings.caSecretId);
      setCaSecretValue(settings.caSecretValue);
      handleUpdate(settings);
      if (typeof settings !== 'undefined') {
        // await loadPulseMetrics();
      }
      else {
        const statusMessage = document.getElementById("statusMessage");
        if (statusMessage === null) return;
        statusMessage.style.display = 'block';
        statusMessage.innerHTML = `Configure Dashboard Extension to load metrics.`;
        configure();
      }
      return () => {
        tableau.extension.settings.removeEventListener(tableau.TableauEventType.SettingsChanged);
      }
    })
  }, [])

  useEffect(() => {
    if (innerRef.current) {
      const extension = innerRef.current;
      console.log(`typeof extension: ${typeof extension}`);
      console.log(`typeof window.extension: ${typeof window.extension}`);


      // handles all viz event listeners and clears them
      const eventListeners = handleExtensionEventListeners(extension);
      return eventListeners;
    }
  }, [innerRef])

  return (
    <div>
      {process.env.DEBUG === 'true'?
      <div>pulseExtension.jsx
      <br></br>
      ------------------
      <br></br>

        {tableauUrl}, {siteName}, {userName}, {caClientId}, {caSecretId}, {caSecretValue}
        <br></br>
        {JSON.stringify(secureData,null,2)}
      </div>
      :null}
      
      {!secureData.isReady ? 
      <p>Configure Extension</p> : 
        <TableauExtension>

        </TableauExtension>
      }
      <ExpireSessionButton/>
      {process.env.DEBUG === 'true'?
      <div>
      End pulseExtension.jsx
      <br></br>
      ----------------------
      </div>:null}
    </div>
  )

})

const handleExtensionEventListeners = (extension) => {

  const handleSettingsChange = async (settingsEvent) => {
    console.log(`Settings updated`);
    settings = { ...((settingsEvent).newSettings) };
    // await loadPulseMetrics();
  }
  extension.tableau.extensions.settings.addEventListener(tableau.TableauEventType.SettingsChanged, handleSettingsChange);
  // // cleanup after effects
  return () => {
    extension.tableau.extensions.settings.removeEventListener(tableau.TableauEventType.SettingsChanged, handleSettingsChange);
  }
}