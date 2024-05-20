// eslint-disable-next-line no-unused-vars
import { tab_extension } from 'libs';
import { useEffect, useState, useRef, forwardRef, useId } from 'react';
import { Input, DropdownMenu, Button } from "components/ui/";
export const PulseExtensionDialog = (props) => {
  let settings;
  const [tableauUrl, setTableauUrl] = useState('undefined');
  const tableauUrlRef = useRef(tableauUrl);
  const [tableauUrlFQDN, setTableauUrlFQDN] = useState('undefined');
  const tableauUrlFQDNRef = useRef(tableauUrlFQDN);
  const [siteName, setSiteName] = useState('undefined');
  const siteNameRef = useRef(siteName);
  const [userName, setUserName] = useState('undefined');
  const userNameRef = useRef(userName);
  const [caClientId, setCaClientId] = useState('undefined');
  const caClientIdRef = useRef(caClientId);
  const [caSecretId, setCaSecretId] = useState('undefined');
  const caSecretIdRef = useRef(caSecretId);
  const [caSecretValue, setCaSecretValue] = useState('undefined');
  const caSecretValueRef = useRef(caSecretValue);

  useEffect(() => {
    tableauUrlRef.current = tableauUrl;
  }, [tableauUrl]);
    useEffect(() => {
      setTableauUrlFQDN(`https://${tableauUrl}.online.tableau.com`);
  }, [tableauUrl]);
  useEffect(() => {
    tableauUrlFQDNRef.current = tableauUrlFQDN;
  }, [tableauUrlFQDN]);
  useEffect(() => {
    siteNameRef.current = siteName;
  }, [siteName]);
  useEffect(() => {
    userNameRef.current = userName;
  }, [userName]);
  useEffect(() => {
    caClientIdRef.current = caClientId;
  }, [caClientId]);
  useEffect(() => {
    caSecretIdRef.current = caSecretId;
  }, [caSecretId]);
  useEffect(() => {
    caSecretValueRef.current = caSecretValue;
  }, [caSecretValue]);

  /**
   * Stores the selected datasource IDs in the extension settings,
   * closes the dialog, and sends a payload back to the parent.
  */
  function closeDialog() {
    console.log('Closing dialog...');


    var selectedMetrics = [];
    var checkboxes = document.querySelectorAll('input[name=metrics]:checked');
    checkboxes.forEach(checkbox => {
      selectedMetrics.push((checkbox).value);
    });
    console.log('Selected Metrics:', selectedMetrics);
    // Here you can do whatever you want with the selected metrics
    tableau.extensions.settings.set('tableauUrl', tableauUrlFQDNRef.current);
    tableau.extensions.settings.set('siteName', siteNameRef.current);
    tableau.extensions.settings.set('userName', userNameRef.current);
    tableau.extensions.settings.set('caClientId', caClientIdRef.current);
    tableau.extensions.settings.set('caSecretId', caSecretIdRef.current);
    tableau.extensions.settings.set('caSecretValue', caSecretValueRef.current);

    let obj = {
      tableauUrl: tableauUrlFQDNRef.current,
      siteName: siteNameRef.current,
      userName: userNameRef.current,
      caClientId: caClientIdRef.current,
      caSecretId: caSecretIdRef.current,
      caSecretValue: caSecretValueRef.current
    }

    // Function to remove event listeners for all input elements
    function removeEventListeners() {
      document.getElementById('input').removeEventListener('change');
    }

    tableau.extensions.settings.saveAsync().then((newSavedSettings) => {
      console.log('closing...');
      console.log(obj);
      console.log(JSON.stringify(obj));
      tableau.extensions.ui.closeDialog(JSON.stringify(obj));
    }).catch((err) => {
      console.log(`an error occurred closing the dialogue box: ${err} ${err.stack}`);
    });
    return () => {
      document.getElementById('closeButton').removeEventListener('click', closeDialog);
    };
  }


  useEffect(() => {
    tableau.extensions.initializeDialogAsync().then(function (settingsStr) {


      document.getElementById('closeButton').addEventListener('click', closeDialog);

      // const dashboard = tableau.extensions.dashboardContent.dashboard;

      const allSettings = tableau.extensions.settings.getAll();
      let settingsDefault = { ...JSON.parse(settingsStr) };
      // settings = {
      //   tableauUrl: allSettings.tableauUrl || settingsDefault.tableauUrl,
      //   siteName: allSettings.siteName || settingsDefault.siteName,
      //   userName: allSettings.userName || settingsDefault.userName,
      //   caClientId: allSettings.caClientId || settingsDefault.caClientId,
      //   caSecretId: allSettings.caSecretId || settingsDefault.caSecretId,
      //   caSecretValue: allSettings.caSecretValue || settingsDefault.caSecretValue
      // };
      let tableauUrl = allSettings.tableauUrl || settingsDefault.tableauUrl;
      console.log(tableauUrl)
      if (typeof tableauUrl !== 'undefined') {
        let match = tableauUrl.match(/https:\/\/([^.]+)\.online\.tableau\.com/);
        if (match && match.length > 1) {
          // Set the value of the dropdown to the extracted part of the URL
          setTableauUrl(match[1]);
        }
      };
      // setTableauUrl(allSettings.tableauUrl || settingsDefault.tableauUrl);
      setSiteName(allSettings.siteName || settingsDefault.siteName);
      setUserName(allSettings.userName || settingsDefault.userName);
      setCaClientId(allSettings.caClientId || settingsDefault.caClientId);
      setCaSecretId(allSettings.caSecretId || settingsDefault.caSecretId);
      setCaSecretValue(allSettings.caSecretValue || settingsDefault.caSecretValue);

      // let tabUrl = document.getElementById('tableauUrl')
      // if (tabUrl !== null) {
      //   // tabUrl.value = tableauUrl;
      //   tabUrl.value = tableauUrl;
      //   // if tabUrl === null, everything below should be null, too.
      //   // Check if the match was found
      //   document.getElementById('userName').value = userName;
      //   document.getElementById('siteName').value = siteName;
      //   document.getElementById('caClientId').value = caClientId;
      //   document.getElementById('caSecretId').value = caSecretId;
      //   document.getElementById('caSecretValue').value = caSecretValue;
      //   // document.getElementById('userName').value = settings.userName.replace(/"/g, '');
      //   // document.getElementById('siteName').value = settings.siteName.replace(/"/g, '');
      //   // document.getElementById('caClientId').value = settings.caClientId.replace(/"/g, '');
      //   // document.getElementById('caSecretId').value = settings.caSecretId.replace(/"/g, '');
      //   // document.getElementById('caSecretValue').value = settings.caSecretValue.replace(/"/g, '');

      //   // attachEventListeners();
      // }

    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect(() => {
  //   document.getElementById('tableauUrl').value = tableauUrlFQDN;
  //   document.getElementById('userName').value = userName;
  //   document.getElementById('siteName').value = siteName;
  //   document.getElementById('caClientId').value = caClientId;
  //   document.getElementById('caSecretId').value = caSecretId;
  //   document.getElementById('caSecretValue').value = caSecretValue;

  // }, [tableauUrlFQDN, userName, siteName, caClientId, caSecretId, caSecretValue])

  function handleTableauUrl(event) {
    setTableauUrl(event.target.value);
  }
  function handleSiteName(event) {
    setSiteName(event.target.value);
  }
  function handleUserName(event) {
    setUserName(event.target.value);
  }
  function handleCaClientId(event) {
    setCaClientId(event.target.value);
  }
  function handleCaSecretId(event) {
    setCaSecretId(event.target.value);
  }
  function handleCaSecretValue(event) {
    setCaSecretValue(event.target.value);
  }
  const handleTableauUrlChange = (event) => {
    setTableauUrl(event.target.value); // Update the state with the selected value
  };

  function openTab(name) {

  }
  return (
    <div className="container">
      <h4>Pulse Embed Extension</h4>
      <p>
        This Extension allows embedding of Pulse metrics in the dashboard.
      </p>
      <hr />
      <div className="tabs">
        <button className="tabLinks" onClick={openTab('connectionTab')}>Connection</button>
        <button className="tabLinks" onClick={openTab('metricsTab')}>Metrics</button>
      </div>
      <div id="connectionTab" className="tabContent">
        <h5>Connection to Tableau:</h5>

        <div className="inputDiv">
          <label htmlFor="tableauUrl">Tableau Pod</label>
          <select id="tableauUrl" value={tableauUrl} onChange={handleTableauUrlChange}>
            <option value="prod-apsoutheast-a">Asia Pacific - Australia - (prod-apsoutheast-a)</option>
            <option value="prod-apnortheast-a">Asia Pacific - Japan - (prod-apnortheast-a)</option>
            <option value="prod-ca-a">Canada - Quebec - (prod-ca-a)</option>
            <option value="dub01">Europe - Ireland - (DUB01)</option>
            <option value="ew1a">Europe - Ireland - (EW1A)</option>
            <option value="prod-uk-a">Europe - UK - (prod-uk-a)</option>
            <option value="useast-1">United States - East - (useast-1)</option>
            <option value="prod-useast-a">United States - East - (prod-useast-a)</option>
            <option value="prod-useast-b">United States - East - (prod-useast-b)</option>
            <option value="10ax">United States - West - (10AX)</option>
            <option value="10ay">United States - West - (10AY)</option>
            <option value="10az">United States - West - (10AZ)</option>
            <option value="uw2b">United States - West - (UW2B)</option>
          </select>
        </div>

        {/* <div className="inputDiv">
          <label htmlFor="siteName">Site Name</label>
          <Input type="text" id="siteName" placeholder="Enter Site Name" onChange={handleSiteName} />
        </div> */}
        <div className="inputDiv">
          <label htmlFor="siteName">Site Name</label>
          <Input type="text" id="siteName" value={siteName} onChange={handleSiteName} placeholder="Enter Site Name" />
        </div>
        <div className="inputDiv">
          <label htmlFor="userName">User Name</label>
          <Input type="text" id="userName" value={userName} onChange={handleUserName} placeholder="Enter User Name" />
        </div>
        <div className="inputDiv">
          <label htmlFor="caClientId">Client ID</label>
          <Input type="text" id="caClientId" value={caClientId} onChange={handleCaClientId} placeholder="Enter Client ID" />
        </div>
        <div className="inputDiv">
          <label htmlFor="caSecretId">Secret ID</label>
          <Input type="text" id="caSecretId" value={caSecretId} onChange={handleCaSecretId} placeholder="Enter Secret ID" />
        </div>
        <div className="inputDiv">
          <label htmlFor="caSecretValue">Secret Value</label>
          <Input type="text" id="caSecretValue" value={caSecretValue} onChange={handleCaSecretValue} placeholder="Enter Secret Value" />
        </div>
      </div>


      <div id="metricsTab" className="tabContent">
        <h5>Metrics</h5>
        <div id="metricsList"></div>
      </div>


      <Button id="closeButton">Close and Save</Button>
    </div>
  )
}