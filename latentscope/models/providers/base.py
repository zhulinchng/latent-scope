class EmbedModelProvider:
    def __init__(self, name, params, base_url=None):
        self.name = name
        self.params = params
        self.base_url = base_url

    def load_model(self):
        raise NotImplementedError("This method should be implemented by subclasses.")

    def embed(self, text):
        raise NotImplementedError("This method should be implemented by subclasses.")

class ChatModelProvider:
    def __init__(self, name, params, base_url=None):
        self.name = name
        self.params = params
        self.base_url = base_url

    def load_model(self):
        raise NotImplementedError("This method should be implemented by subclasses.")

    def chat(self, messages):
        raise NotImplementedError("This method should be implemented by subclasses.")

