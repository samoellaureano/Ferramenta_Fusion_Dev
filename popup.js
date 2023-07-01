document.addEventListener('DOMContentLoaded', function() {
    var matchesInput = document.getElementById('matches-input');
    var saveButton = document.getElementById('save-button');
  
    // Carregar o valor atual de matches do armazenamento local
    chrome.storage.local.get(['matches'], function(result) {
      if (result.matches) {
        matchesInput.value = result.matches;
      }
    });
  
    // Lidar com o evento de clique no botão "Salvar"
    saveButton.addEventListener('click', function() {
      var matches = matchesInput.value;
  
      // Atualizar a propriedade "matches" do manifesto
      chrome.storage.local.set({ matches: matches }, function() {
        // Notificar o usuário que as configurações foram salvas
        alert('Configurações salvas com sucesso!');
  
        // Recarregar a extensão para que as alterações tenham efeito
        chrome.runtime.reload();
      });
    });
  });
  