import { useState, useEffect, useCallback } from 'react';
import { apiService, apiUrl } from '../lib/apiService';
const readonly = import.meta.env.MODE == 'read_only';

import CustomModels from '../components/CustomModels';
import CustomEmbeddingModels from '../components/CustomEmbeddingModels';

import styles from './Settings.module.css';

const Settings = () => {
  const [envSettings, setEnvSettings] = useState({});

  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    apiService
      .fetchSettings()
      .then((data) => {
        setEnvSettings(data);
        console.log('settings data', data);
      })
      .catch((error) => console.error('Error fetching settings:', error));
  }, [refresh]);

  const saveKey = useCallback(
    (key, e) => {
      e.preventDefault();
      const newValue = e.target.elements[0].value;
      if (!readonly) {
        fetch(`${apiUrl}/settings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ [key]: newValue }),
        })
          .then((response) => {
            if (response.ok) {
              console.log(`${key} updated successfully`);
            } else {
              console.error(`Failed to update ${key}`);
            }
            setRefresh(refresh + 1);
          })
          .catch((error) => console.error('Error updating settings:', error));
      } else {
        console.error('Settings are read-only');
      }
    },
    [refresh]
  );

  return (
    <div className={styles['settings']}>
      <h2 className={styles['header']}>Settings</h2>
      <div className={styles['dot-env']}>
        Settings are stored in the following <code>.env</code> file:<br></br>
        <code>{envSettings.env_file}</code>
      </div>
      <div className={styles['data-dir']}>
        All data is stored in the following directory:<br></br>
        <code>{envSettings.data_dir}</code>
        <br></br>
        As set in the environment variable <code>LATENT_SCOPE_DATA</code>
      </div>
      <div className={styles['api-keys']}>
        <b>The following API keys are available for use:</b>
        {envSettings.supported_api_keys?.map((key) => {
          return (
            <span className={styles['api-key']} key={key}>
              {envSettings.api_keys.indexOf(key) >= 0 ? (
                <span className={styles['api-key-status']}>✅</span>
              ) : (
                <span className={styles['api-key-status']}>◻️</span>
              )}
              &nbsp;
              <span className={styles['key-text']}>{key}</span>
              <form onSubmit={(e) => saveKey(key, e)}>
                <input type="password" className={styles['api-key-input']} />
                <button>{envSettings.api_keys.indexOf(key) >= 0 ? 'Update' : 'Save'}</button>
              </form>
            </span>
          );
        })}
      </div>
      <div className={styles['custom-models']}>
        <h3>Custom Models</h3>
        <div>
          Add a custom model to use for embeddings. Saved in:
          <code>{envSettings.data_dir}/custom_embedding_models.json</code>
        </div>

        <CustomEmbeddingModels />

        <div>
          Add a custom model to use for labelling clusters. Saved in:
          <code>{envSettings.data_dir}/custom_models.json</code>
        </div>

        <CustomModels />
      </div>
    </div>
  );
};

export default Settings;
