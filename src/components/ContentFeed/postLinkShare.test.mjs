import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPostLinkPayload, buildWhatsAppShareUrl, shareLinkWithSystem, openWhatsAppLink } from './postLinkShare.js';

const payload = buildPostLinkPayload({ title: '检修 & 保养 #1 🚚' }, 'https://example.com/?postId=101');

test('渠道只传帖子标题与链接，不传海报文件；WhatsApp 文本可完整还原', () => {
  assert.deepEqual(Object.keys(payload).sort(), ['title', 'url']);
  const url = new URL(buildWhatsAppShareUrl(payload));
  assert.equal(url.origin, 'https://wa.me');
  assert.equal(url.searchParams.get('text'), `${payload.title}\n${payload.url}`);
});

test('系统不支持或不接受链接时可恢复，不误调用分享', async () => {
  assert.equal(await shareLinkWithSystem(payload, {}), 'unsupported');
  assert.equal(await shareLinkWithSystem(payload, {
    canShare: () => false,
    share: () => { throw Error('不应调用'); },
  }), 'unsupported');
});

test('系统分享返回、取消、权限失败分别处理，均不等同外部发送成功', async () => {
  let received;
  assert.equal(await shareLinkWithSystem(payload, { share: async data => { received = data; } }), 'returned');
  assert.deepEqual(received, payload);
  assert.equal(await shareLinkWithSystem(payload, { share: async () => { throw { name: 'AbortError' }; } }), 'cancelled');
  assert.equal(await shareLinkWithSystem(payload, { share: async () => { throw { name: 'NotAllowedError' }; } }), 'failed');
});

test('WhatsApp 弹窗被阻止、导航失败均可识别', () => {
  assert.equal(openWhatsAppLink(payload, () => null), 'blocked');
  let closed = false;
  assert.equal(openWhatsAppLink(payload, () => ({
    location: { replace: () => { throw Error('navigation failed'); } },
    close: () => { closed = true; },
  })), 'failed');
  assert.equal(closed, true);
});

test('跳转前移除 opener，只向官方 WhatsApp 地址导航', () => {
  let destination;
  const popup = { opener: {}, location: { replace: value => { destination = value; } } };
  assert.equal(openWhatsAppLink(payload, (url, target) => {
    assert.equal(url, 'about:blank');
    assert.equal(target, '_blank');
    return popup;
  }), 'opened');
  assert.equal(popup.opener, null);
  assert.equal(destination, buildWhatsAppShareUrl(payload));
});
