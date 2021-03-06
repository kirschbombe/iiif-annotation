import Vue from 'vue'
//import index from 'karma-chai'
import { mount } from '@vue/test-utils'

import iiifAnnotation from '../src/components/iiifannotation.vue'

import flushPromises from 'flush-promises'

describe('Component', () => {
    test('test open annotation', async ()  => {
      const wrapper =  mount(iiifAnnotation,{
        propsData: {
          annotationurl: 'paragraph.json'
        }
      })
      await wrapper.vm.$nextTick()
      await flushPromises()
      const annotation = wrapper.vm.$data.annotation_items[0]
      expect(wrapper.vm.$data.annotation_items).toHaveLength(1)
      expect(wrapper.vm.$data.manifest.label).toBe("Letter from Francis Crick to Michael Crick")
      expect(annotation.label).toBe(undefined)
      expect(annotation.image).toEqual(['<img src=\"https://dlcs.io/iiif-img/wellcome/1/ce30a1a7-a606-4b5e-b2ad-c13677d3e8f6/310,1250,1850,1180/full/0/default.jpg\" alt=\"Jim Watson and I have probably made a most important discovery. We have built a model for the structure of des-oxy-ribose-nucleic-acid (read it carefully) called D.N.A. for short. You may remember that the genes of the chromosomes - which carry the hereditary factors - are made up of protein and D.N.A.\">'])
      expect(annotation['content']['ocr']).toEqual(["Jim Watson and I have probably made a\nmost important discovery. We have built a model for\nthe structure of des-oxy-ribose-nucleic-acid (read it\ncarefully) called D.N.A. for short. You may remember\nthat the genes of the chromosomes - which carry the\nhereditary factors - are made up of protein and\nD.N.A."])
    })
    test('test mirador annotation list', async ()  => {
      const wrapper =  mount(iiifAnnotation,{
        propsData: {
          annotationlist: 'mc00240.json'
        }
      })
      await wrapper.vm.$nextTick()
      await flushPromises()
      const annotations = wrapper.vm.$data.annotation_items
      expect(annotations[1]['rendered_content']).toBe('<div class="dctypes:text"><p>DETAILS OF BALCONY RAILING</p></div>')
      expect(annotations[0].label).toBe(undefined)
      expect(annotations[0].tags).toBe('')
      expect(annotations[0].image[0].replace(/(\r\n|\n|\r)/gm, "")).toEqual("<svg viewBox=\"740 567 3998 4586\" aria-label=\"Image section of &quot;Cross section, interior details&quot;\"><defs><pattern patternUnits=\"objectBoundingBox\" id=\"mc002400-0\" width=\"100%\" height=\"100%\">      <image xlink:href=\"https://iiif.lib.ncsu.edu/iiif/mc00240-001-ff0093-001-001_0010/740,567,3998,4586/full/0/default.jpg\" width=\"100%\" height=\"100%\" x=\"0\" y=\"0\"></image>      </pattern></defs><path xmlns=\"http://www.w3.org/2000/svg\" d=\"M740.00502,566.97616l1998.77039,0l0,0l1998.77039,0l0,2293.02384l0,2293.02384l-1998.77039,0l-1998.77039,0l0,-2293.02384z\" data-paper-data=\"{&quot;defaultStrokeValue&quot;:1,&quot;editStrokeValue&quot;:5,&quot;currentStrokeValue&quot;:5,&quot;rotation&quot;:0,&quot;annotation&quot;:null,&quot;editable&quot;:true}\" id=\"rectangle_dcc88375-b2ff-4b41-b061-6d9b5f6b81fc\" fill-opacity=\"1\" fill=\"url(#mc002400-0)\" fill-rule=\"nonzero\" stroke=\"none\" stroke-width=\"17.94228\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\" stroke-miterlimit=\"10\" stroke-dasharray=\"\" stroke-dashoffset=\"0\" font-family=\"none\" font-weight=\"none\" font-size=\"none\" text-anchor=\"none\" style=\"mix-blend-mode: normal\"></path></svg>")
      expect(wrapper.vm.$data.manifest.label).toBe("Cross section, interior details")
      expect(annotations[0].altText).toBe('Image section of "Cross section, interior details"')
      expect(annotations[1].tags).toBe('<div class="tagging">balcony</div><div class="tagging">railing</div>')
      expect(annotations.length).toBe(3)
    })
    test('test w3 annotations', async ()  => {
      const wrapper =  mount(iiifAnnotation,{
        propsData: {
          annotationurl: 'bees.json'
        }
      })
      await wrapper.vm.$nextTick()
      await flushPromises()
      const annotations = wrapper.vm.$data.annotation_items[0]
      expect(annotations.image).toEqual(["<img src=\"https://iiif.lib.ncsu.edu/iiif/segIns_023/318,499,2891,3339/full/0/default.jpg\" alt=\"The Bees\">"])
      expect(annotations['content']['label']).toBe("The Bees")
      expect(annotations['content']['ocr']).toEqual([])
      expect(annotations.fullImage).toBe("https://iiif.lib.ncsu.edu/iiif/segIns_023/full/1200,/0/default.jpg")
      expect(annotations['rendered_content']).toBe('<figcaption class=\"label\">The Bees</figcaption>')
      expect(annotations.tags).toBe('<div class="tagging">So many bees.</div>')
      expect(annotations.altText).toBe("The Bees")
    })
    test('test w3 annotations list', async ()  => {
      const wrapper =  mount(iiifAnnotation,{
        propsData: {
          annotationlist: 'page.json'
        }
      })
      await wrapper.vm.$nextTick()
      await flushPromises()
      const annotations = wrapper.vm.$data.annotation_items[0]
      expect(annotations.image).toEqual(["<img src=\"https://iiif.lib.ncsu.edu/iiif/mc00084-001-te0159-000-001_0001/1800,2000,500,500/full/0/default.jpg\" alt=\"Image section of &quot;undefined&quot;\">"])
      expect(annotations.id).toBe('page0')
      expect(annotations.label).toBe(undefined)
      expect(annotations['content']['ocr']).toEqual([])
      expect(annotations['rendered_content']).toEqual(`<div class="textualbody"><iiif-annotation annotationurl='https://dnoneill.github.io/annotate/annotations/0001-1.json'></iiif-annotation></div>`)
    })
    test('test oa list', async ()  => {
      const wrapper =  mount(iiifAnnotation,{
        propsData: {
          annotationlist: 'oa.json'
        }
      })
      await wrapper.vm.$nextTick()
      await flushPromises()
      const annotations = wrapper.vm.$data.annotation_items[0]
      expect(annotations.image).toEqual(["<img src=\"https://iiif.lib.ncsu.edu/iiif/segIns_023/6270,3903,2250,2250/full/0/default.jpg\" alt=\"Annotation 1\">"])
      expect(annotations['content']['ocr']).toEqual(["Annotation 1"])
    })
    test('test settings', async ()  => {
      const wrapper =  mount(iiifAnnotation,{
        propsData: {
          annotationlist: 'oa.json',
          styling: 'image_only:true'
        }
      })
      await wrapper.vm.$nextTick()
      await flushPromises()
      const annotations = wrapper.vm.$data.annotation_items[0]
      expect(annotations.image).toEqual(["<img src=\"https://iiif.lib.ncsu.edu/iiif/segIns_023/6270,3903,2250,2250/full/0/default.jpg\" alt=\"Image section of &quot;undefined&quot;\">"])
      expect(Object.keys(annotations).length).toBe(4)
      expect(Object.keys(annotations)).toEqual(["image", "altText", "id", "fullImage"])
    })
    test('test non-existent urls', async ()  => {
      const wrapper =  mount(iiifAnnotation,{
        propsData: {
          annotationurl: 'bees2.json'
        }
      })
      await wrapper.vm.$nextTick()
      await flushPromises()
      expect(wrapper.html()).toContain('"bees2.json" did not render. Please ensure your annotation link is correct.')
    })
})
