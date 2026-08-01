function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('メール送信')
    .addItem('テスト送信', 'sendTestEmail')
    .addItem('チェック行へ送信', 'sendCheckedEmails')
    .addSeparator()
    .addItem('選択行の送信済みをリセット', 'resetSelectedRows')
    .addToUi();
}

function sendTestEmail() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const bodySheet = ss.getSheetByName('メール本文');
  const ui = SpreadsheetApp.getUi();
  const settings = getMailSettings_(bodySheet);

  if (!settings.testEmail) {
    ui.alert('メール本文タブのB5にテスト送信先を入力してください。');
    return;
  }

  const body = renderTemplate_(settings.template, {
    name: 'テスト 太郎',
    honorific: '様',
    memberType: 'テスト',
    memo: 'これはテスト送信です。'
  });

  MailApp.sendEmail(buildMailOptions_(settings, settings.testEmail, body));
  appendLog_(ss, 'テスト 太郎', settings.testEmail, settings.subject, 'テスト送信OK', '', settings.senderName, '');
  ui.alert('テスト送信しました。');
}

function sendCheckedEmails() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('名簿');
  const bodySheet = ss.getSheetByName('メール本文');
  const ui = SpreadsheetApp.getUi();
  const settings = getMailSettings_(bodySheet);
  const values = sheet.getDataRange().getValues();
  const targets = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const checked = row[0] === true;
    const alreadySent = row[7] === true;
    const status = String(row[5] || '').trim();
    const email = String(row[3] || '').trim();

    if (checked && !alreadySent && status !== '停止' && email) {
      targets.push({ rowIndex: i + 1, row: row });
    }
  }

  if (targets.length === 0) {
    ui.alert('送信対象がありません。名簿タブの「送信対象」にチェックを入れてください。');
    return;
  }

  const confirm = ui.alert(
    '送信確認',
    targets.length + '件に個別送信します。添付ファイルURLが入っている場合は添付して送ります。送信してよいですか？',
    ui.ButtonSet.OK_CANCEL
  );
  if (confirm !== ui.Button.OK) return;

  targets.forEach(function(item) {
    const row = item.row;
    const name = String(row[1] || '').trim();
    const honorific = String(row[2] || '様').trim();
    const email = String(row[3] || '').trim();
    const memberType = String(row[4] || '').trim();
    const memo = String(row[6] || '').trim();

    try {
      const body = renderTemplate_(settings.template, { name, honorific, memberType, memo });
      MailApp.sendEmail(buildMailOptions_(settings, email, body));

      sheet.getRange(item.rowIndex, 8).setValue(true);
      sheet.getRange(item.rowIndex, 9).setValue(new Date());
      sheet.getRange(item.rowIndex, 10).setValue('成功');
      sheet.getRange(item.rowIndex, 11).setValue('');
      sheet.getRange(item.rowIndex, 12).setValue(settings.subject);
      sheet.getRange(item.rowIndex, 13).setValue(settings.senderName);
      appendLog_(ss, name, email, settings.subject, '送信OK', '', settings.senderName, item.rowIndex);
    } catch (e) {
      sheet.getRange(item.rowIndex, 10).setValue('エラー');
      sheet.getRange(item.rowIndex, 11).setValue(e.message);
      appendLog_(ss, name, email, settings.subject, 'エラー', e.message, settings.senderName, item.rowIndex);
    }
  });

  ui.alert('送信処理が完了しました。送信ログを確認してください。');
}

function resetSelectedRows() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const ui = SpreadsheetApp.getUi();

  if (sheet.getName() !== '名簿') {
    ui.alert('名簿タブでリセットしたい行を選択してから実行してください。');
    return;
  }

  const range = sheet.getActiveRange();
  if (!range || range.getRow() === 1) {
    ui.alert('リセットしたいデータ行を選択してください。');
    return;
  }

  sheet.getRange(range.getRow(), 8, range.getNumRows(), 6).clearContent();
  ui.alert('選択行の送信済み情報をリセットしました。');
}

function getMailSettings_(bodySheet) {
  return {
    subject: String(bodySheet.getRange('B2').getValue()).trim(),
    senderName: String(bodySheet.getRange('B3').getValue()).trim(),
    replyTo: String(bodySheet.getRange('B4').getValue()).trim(),
    testEmail: String(bodySheet.getRange('B5').getValue()).trim(),
    template: String(bodySheet.getRange('B6').getValue()),
    attachmentUrls: String(bodySheet.getRange('B7').getValue()).trim()
  };
}

function buildMailOptions_(settings, to, body) {
  const options = {
    to: to,
    subject: settings.subject,
    body: body,
    name: settings.senderName,
    replyTo: settings.replyTo || undefined
  };

  const attachments = getAttachments_(settings.attachmentUrls);
  if (attachments.length > 0) {
    options.attachments = attachments;
  }

  return options;
}

function getAttachments_(text) {
  if (!text) return [];

  return text
    .split(/\n|,/)
    .map(function(value) { return value.trim(); })
    .filter(Boolean)
    .map(function(value) {
      const fileId = extractDriveFileId_(value);
      const file = DriveApp.getFileById(fileId);
      return file.getBlob().setName(file.getName());
    });
}

function extractDriveFileId_(value) {
  const text = String(value || '').trim();
  const patterns = [
    /\/d\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
    /^([a-zA-Z0-9_-]{20,})$/
  ];

  for (let i = 0; i < patterns.length; i++) {
    const match = text.match(patterns[i]);
    if (match) return match[1];
  }

  throw new Error('添付ファイルURLからファイルIDを読み取れません: ' + text);
}

function renderTemplate_(template, values) {
  return String(template)
    .replaceAll('{{氏名}}', values.name || '')
    .replaceAll('{{敬称}}', values.honorific || '様')
    .replaceAll('{{会員種別}}', values.memberType || '')
    .replaceAll('{{個別メモ}}', values.memo || '');
}

function appendLog_(ss, name, email, subject, result, error, sender, rowNumber) {
  let logSheet = ss.getSheetByName('送信ログ');
  if (!logSheet) {
    logSheet = ss.insertSheet('送信ログ');
    logSheet.appendRow(['日時', '氏名', 'メールアドレス', '件名', '結果', 'エラー', '送信者', '行番号']);
  }

  logSheet.appendRow([
    new Date(),
    name,
    email,
    subject,
    result,
    error,
    sender,
    rowNumber
  ]);
}
