export default `
<mjml lang="nl">
  <mj-head>
    <mj-title>Herinnering {{ groupName }}-taak</mj-title>
    <mj-attributes>
      <mj-class name="alert" color="#ff0044" font-weight="bold" font-size="20px" />
      <mj-class name="date" color="#2200dd" font-weight="bold" font-size="20px" />
      <mj-class name="date-alert" color="#ff0044" font-weight="bold" font-size="20px" />
      <mj-class name="task" font-size="18px" font-weight="bold" />
      <mj-class name="task-alert" color="#ff0044" font-size="18px" font-weight="bold" />
      <mj-class name="msg" font-size="14px" />
      <mj-class name="sub" font-size="14px" />
      <mj-class name="ijsplanner-foot" font-size="18px" align="center" />
    </mj-attributes>
  </mj-head>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text mj-class="msg"> Dag {{username}}, </mj-text>
        <mj-text mj-class="msg"> Ter herinnering, je bent ingeschreven morgen, {{ dateStr }}, van {{ timeStart }} tot {{ timeEnd }} voor een {{ groupName }}-taak{{#if comment}} [{{comment}}]{{/if}}. </mj-text>
        <mj-divider />

        <mj-text mj-class="sub">
          Uitschrijven van deze herinnerings-emails kan in de "email notificaties"
          instellingen van
          je account op <a href="https://ijsplanner.be">ijsplanner.be </a>.
        </mj-text>

        <mj-divider />

        <mj-text mj-class="ijsplanner-foot">
          <a href="https://ijsplanner.be"> IJsplanner.be </a>
        </mj-text>

        <mj-text align="center">
          <a href="https://deurnese-ijsberen.be"> Deurnese IJsberen vzw </a>
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;
