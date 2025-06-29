import { useState, useEffect, useCallback } from 'react';
import { Button } from 'react-element-forge';
import { apiService } from '../lib/apiService';

import styles from './CustomModels.module.scss';

function CustomEmbeddingModels({ data_dir }) {
  const [customModels, setCustomEmbeddingModels] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch existing custom models on component mount
  useEffect(() => {
    apiService.fetchCustomEmbeddingModels().then((models) => setCustomEmbeddingModels(models));
  }, []);

  const handleAddModel = useCallback(async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.target;
    const data = new FormData(form);
    const newModel = {
      name: data.get('name'),
      url: data.get('url'),
      params: {},
      provider: 'custom_embedding',
    };

    try {
      const updatedModels = await apiService.addCustomEmbeddingModel(newModel);
      console.log('updatedModels', updatedModels);
      setCustomEmbeddingModels(updatedModels);
      form.reset();
    } catch (error) {
      console.error('Failed to add custom model:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const handleDeleteModel = useCallback(
    async (modelId) => {
      try {
        await apiService.deleteCustomEmbeddingModel(modelId);
        setCustomEmbeddingModels(customModels.filter((model) => model.id !== modelId));
      } catch (error) {
        console.error('Failed to delete custom model:', error);
      }
    },
    [customModels]
  );

  return (
    <div className={styles['custom-models']}>
      <div className={styles['custom-models-setup']}>
        <div className={styles['custom-models-form']}>
          <form onSubmit={handleAddModel}>
            <label>
              <span className={styles['form-label']}>Embedding Model: </span>
              <input
                type="text"
                name="name"
                placeholder="gte-base"
                required
                disabled={isSubmitting}
              />
            </label>

            <label>
              <span className={styles['form-label']}>URL: </span>
              <input
                type="url"
                name="url"
                placeholder="http://localhost:8080/v1"
                required
                disabled={isSubmitting}
              />
            </label>

            <Button
              type="submit"
              color="primary"
              disabled={isSubmitting}
              text="Add Embedding Model"
            />
          </form>
        </div>

        <div className={styles['custom-models-list']}>
          {customModels.map((model, index) => (
            <div className={styles['item']} key={index}>
              <div className={styles['item-info']}>
                <span className={styles['item-name']}>{model.name}</span>
                <span className={styles['item-url']}>{model.url}</span>
              </div>

              <Button
                className={styles['delete']}
                color="secondary"
                onClick={() => handleDeleteModel(model.id)}
                disabled={isSubmitting}
                text="🗑️"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CustomEmbeddingModels;
