/**
 * Campaign Rule Engine — static prototype (no build tools).
 * Open index.html in Chrome/Edge.
 */

(function () {
  const views = ['dashboard', 'campaigns', 'wizard'];
  const wizardSteps = 5;

  function showView(name) {
    views.forEach(function (v) {
      var el = document.getElementById('view-' + v);
      if (el) el.classList.toggle('hidden', v !== name);
    });
    document.querySelectorAll('[data-nav]').forEach(function (btn) {
      var active = btn.getAttribute('data-nav') === name;
      btn.classList.toggle('bg-[rgba(156,29,38,0.18)]', active);
      btn.classList.toggle('text-rose-300', active);
      btn.classList.toggle('text-[#a89e9a]', !active);
    });
    if (name === 'wizard') {
      goWizardStep(1);
    }
  }

  function goWizardStep(step) {
    step = Math.max(1, Math.min(wizardSteps, step));
    for (var i = 1; i <= wizardSteps; i++) {
      var panel = document.getElementById('wizard-step-' + i);
      if (panel) panel.classList.toggle('hidden', i !== step);
    }
    document.getElementById('wizard-step-label').textContent =
      'Step ' + step + ' of ' + wizardSteps;
    for (var j = 1; j <= wizardSteps; j++) {
      var dot = document.querySelector('[data-wizard-dot="' + j + '"]');
      if (!dot) continue;
      var done = j < step;
      var active = j === step;
      dot.classList.remove(
        'bg-amber-500/30',
        'border-amber-500/50',
        'text-amber-300',
        'bg-[rgba(156,29,38,0.2)]',
        'border-[#9c1d26]',
        'text-white',
        'border-[#342b2e]',
        'text-[#a89e9a]'
      );
      if (done) {
        dot.classList.add('bg-amber-500/30', 'border-amber-500/50', 'text-amber-300');
        dot.textContent = '✓';
      } else if (active) {
        dot.classList.add('bg-[rgba(156,29,38,0.2)]', 'border-[#9c1d26]', 'text-white');
        dot.textContent = String(j);
      } else {
        dot.classList.add('border-[#342b2e]', 'text-[#a89e9a]');
        dot.textContent = String(j);
      }
    }
    var nextBtn = document.getElementById('wizard-btn-next');
    var activateBtn = document.getElementById('wizard-btn-activate');
    if (nextBtn && activateBtn) {
      if (step === wizardSteps) {
        nextBtn.classList.add('hidden');
        activateBtn.classList.remove('hidden');
      } else {
        nextBtn.classList.remove('hidden');
        activateBtn.classList.add('hidden');
      }
    }
    window.__wizardStep = step;
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-nav]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        showView(btn.getAttribute('data-nav'));
      });
    });

    document.getElementById('wizard-btn-next')?.addEventListener('click', function () {
      goWizardStep((window.__wizardStep || 1) + 1);
    });
    document.getElementById('wizard-btn-back')?.addEventListener('click', function () {
      goWizardStep((window.__wizardStep || 1) - 1);
    });
    document.getElementById('wizard-btn-discard')?.addEventListener('click', function () {
      if (confirm('Discard draft?')) showView('campaigns');
    });
    document.getElementById('wizard-btn-activate')?.addEventListener('click', function () {
      alert('Prototype: campaign would activate here.');
      showView('campaigns');
    });

    showView('dashboard');
  });
})();
