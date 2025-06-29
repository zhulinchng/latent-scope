import os
import time
from .base import EmbedModelProvider, ChatModelProvider

from latentscope.util import get_key

class OpenAIEmbedProvider(EmbedModelProvider):
    def load_model(self):
        from openai import OpenAI
        import tiktoken
        api_key = get_key("OPENAI_API_KEY")
        if api_key is None:
            print("ERROR: No API key found for OpenAI")
            print("Missing 'OPENAI_API_KEY' variable in:", f"{os.getcwd()}/.env")

        if self.base_url is None:
            base_url = get_key("OPENAI_BASE_URL")
        else:
            base_url = self.base_url

        if base_url is not None:
            self.client = OpenAI(api_key=api_key, base_url=base_url)
        else:
            self.client = OpenAI(api_key=api_key)

        if not self.custom:
            self.encoder = tiktoken.encoding_for_model(self.name)

    def embed(self, inputs, dimensions=None):
        time.sleep(0.01) # TODO proper rate limiting
        if not self.custom:
            enc = self.encoder
            max_tokens = self.params["max_tokens"]
            inputs = [b.replace("\n", " ") for b in inputs]
            inputs = [enc.decode(enc.encode(b)[:max_tokens]) if len(enc.encode(b)) > max_tokens else b for b in inputs]
            if dimensions is not None and dimensions > 0:
                response = self.client.embeddings.create(
                    input=inputs,
                    model=self.name,
                    dimensions=dimensions
                )
            else:
                response = self.client.embeddings.create(
                    input=inputs,
                    model=self.name
                )
        else:
            response = self.client.embeddings.create(input=inputs, model=self.name)
        embeddings = [embedding.embedding for embedding in response.data]
        return embeddings

class OpenAIChatProvider(ChatModelProvider):
    def load_model(self):
        from openai import OpenAI, AsyncOpenAI
        import tiktoken
        import outlines
        from outlines.models.openai import OpenAIConfig
        if self.base_url is None:
            self.client = AsyncOpenAI(api_key=get_key("OPENAI_API_KEY"))
            self.encoder = tiktoken.encoding_for_model(self.name)
        else:
            self.client = AsyncOpenAI(api_key=get_key("OPENAI_API_KEY"), base_url=self.base_url)
            # even if this is some other model, we wont be able to figure out the tokenizer from custom API
            # so we just use gpt-4o as a fallback, it should be roughly correct for token counts
            self.encoder = tiktoken.encoding_for_model("gpt-4o") 
        config = OpenAIConfig(self.name)
        self.model = outlines.models.openai(self.client, config)
        self.generator = outlines.generate.text(self.model)


    def chat(self, messages):
        response = self.client.chat.completions.create(
            model=self.name,
            messages=messages
        )
        return response.choices[0].message.content

    def summarize(self, items, context=""):
        from .prompts import summarize
        prompt = summarize(items, context)
        return self.generator(prompt)
